package com.arnacon.hackathon_app

import android.app.ProgressDialog
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import java.io.IOException
import java.util.concurrent.TimeUnit

class RedeemActivity : AppCompatActivity() {

    private lateinit var responseTextView: TextView
    private lateinit var progressDialog: ProgressDialog
    private lateinit var returnButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_redeem)

        responseTextView = findViewById(R.id.responseTextView)
        returnButton = findViewById(R.id.returnButton)
        progressDialog = ProgressDialog(this).apply {
            setTitle("Processing")
            setMessage("Please wait...")
            setCancelable(false)
        }

        val qrDataJson = intent.getStringExtra("QR_CODE") ?: return
        sendToCloudFunction(qrDataJson)

        returnButton.setOnClickListener {
            finish()  // Finish this activity and return to MainActivity
        }
    }

    private fun showReturnButton() {
        returnButton.visibility = View.VISIBLE
    }

    private fun sendToCloudFunction(qrDataJson: String) {
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)  // Increase connection timeout
            .readTimeout(30, TimeUnit.SECONDS)     // Increase read timeout
            .writeTimeout(30, TimeUnit.SECONDS)    // Increase write timeout
            .build()

        val requestBody = RequestBody.create("application/json".toMediaTypeOrNull(), qrDataJson)
        val request = Request.Builder()
            .url("https://us-central1-arnacon-nl.cloudfunctions.net/redeemGiftcard")
            .post(requestBody)
            .build()

        progressDialog.show()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    progressDialog.dismiss()
                    responseTextView.text = "Error: ${e.message}"
                    showReturnButton()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    progressDialog.dismiss()
                    if (response.isSuccessful) {
                        responseTextView.text = "Response: ${response.body?.string()}"
                    } else {
                        responseTextView.text = "HTTP Error ${response.code}: ${response.message}"
                    }
                    showReturnButton()
                }
            }
        })
    }
}
