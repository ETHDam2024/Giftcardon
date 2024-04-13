package com.arnacon.hackathon_app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class MainActivity : AppCompatActivity() {
    private lateinit var previewView: PreviewView
    private lateinit var scanButton: Button
    private lateinit var tvQrReadTxt: TextView
    private var cameraProvider: ProcessCameraProvider? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        previewView = findViewById(R.id.previewView)
        scanButton = findViewById(R.id.btn_scan)
        tvQrReadTxt = findViewById(R.id.tv_qr_readTxt)

        fetchBalance()

        scanButton.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                previewView.visibility = View.VISIBLE
                scanButton.visibility = View.GONE
                findViewById<TextView>(R.id.tv_balance).visibility = View.GONE
                startCamera()
            } else {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 1001)
            }
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                bindCameraUseCases()
            } catch (e: Exception) {
                Log.e("CameraXApp", "Failed to get camera provider", e)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun bindCameraUseCases() {
        val preview = Preview.Builder().build().also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }
        val imageAnalysis = ImageAnalysis.Builder().build().apply {
            setAnalyzer(ContextCompat.getMainExecutor(this@MainActivity), YourImageAnalyzer { qrCode ->
                Intent(this@MainActivity, RedeemActivity::class.java).also {
                    it.putExtra("QR_CODE", qrCode)
                    startActivity(it)
                }
                runOnUiThread {
                    stopCamera()
                }
            })
        }

        try {
            cameraProvider?.unbindAll()
            cameraProvider?.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
        } catch (e: Exception) {
            Log.e("CameraXApp", "Binding use cases failed", e)
        }
    }

    private fun stopCamera() {
        cameraProvider?.unbindAll()
        previewView.visibility = View.GONE
        scanButton.visibility = View.VISIBLE
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1001 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            Log.e("CameraXApp", "Permission not granted by the user.")
        }
    }

    inner class YourImageAnalyzer(private val onQrCodeDetected: (String) -> Unit) : ImageAnalysis.Analyzer {
        private val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()
        private val scanner = BarcodeScanning.getClient(options)

        @androidx.annotation.OptIn(ExperimentalGetImage::class)
        override fun analyze(imageProxy: ImageProxy) {
            val mediaImage = imageProxy.image
            if (mediaImage != null) {
                val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        for (barcode in barcodes) {
                            val rawValue = barcode.rawValue ?: ""
                            Log.d("QRCode", "QR Code detected: $rawValue") // Debug log
                            onQrCodeDetected(rawValue)
                            break
                        }
                    }
                    .addOnFailureListener {
                        Log.e("QRCode", "QR Code detection failed", it)
                    }
                    .addOnCompleteListener {
                        imageProxy.close()
                    }
            } else {
                imageProxy.close()
            }
        }
    }

    private fun fetchBalance() {
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("https://us-central1-arnacon-nl.cloudfunctions.net/getUserBalance")  // Replace with your Google Cloud Function URL
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                response.body?.string()?.let {
                    val inCTM = it.dropLast(18)
                    runOnUiThread {
                        findViewById<TextView>(R.id.tv_balance).text = "Your balance: $inCTM CTM"
                    }
                }
            }
        })
    }
}
