// const { buildMimcSponge } = require("circomlibjs")
// const fs = require("fs")
const ethers = require("ethers")
const snarkjs = require("snarkjs")
// const loadWebAssembly = require("./Verifier");
// const { Storage} = require("@google-cloud/storage")

const zeros = ['4077715598027421868978385919369681856828022829195508714057868878450163495635', 
'8187565309656717081402976421359852960622230029428328189552756979581366846699', 
'6895301834187245030515316522859790448465012501199497084202849518174171340027', 
'6078838408095986951624190261069876541619556722982466019369528138628817944578', 
'3067697042166175029653725583611226350242710683356514357790475365257692120409', 
'21800780435703060459349970181723415561602873297274879003106615563665010753293', 
'21312404318513360790352191496922849237521558620837164660107052892863947435426', 
'13585218548519660195577479962149720656105861350961195772352170061108478761433', 
'4264094826236620103391513514283816831516585886481069752812167217189807930375', 
'18493382706357024359627401435454282662495529091587010702289562616159983486498', 
'6265150555420019044590002082192941349445618636339708955967342008331052302669', 
'18353197052745099997274901011967787952740829726068256396128580544534647404741', 
'2297129648109474379186632822969783478225246109904822000716107636668022303783', 
'9866002456789151206693529596967222250962187885202749643297808456333631584323', 
'16318334773584721553202198784966473654931555887795097686572729335262638366559', 
'17882862093715689113713831877164437679004498752272692628098175808117002893738', 
'12754334587001283713710964112167500072470510733802835946986506846102654269685', 
'11506916837733172744569109289998797608545324488294339481119784985579196797442', 
'9179618978605699258702550345422887806605351662508902677736693822912579310752', 
'17480380739438495172229555756668671670386585262040360757434333534680759119049', 
'15148061133137888565805890189823775318941232805231218463316022558476040323204'
]

function convertCallData(calldata) {
    const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => ethers.toBigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
    ]
    const c = [argv[6], argv[7]]
    const input = [argv[8], argv[9]]

    return { a, b, c, input };
}

async function calculateMerkleRootAndPath(levels, elements,mimc,  element = undefined) {
    const capacity = 2 ** levels
    if (elements.length > capacity) throw new Error('Tree is full')
    // const mimc = await buildMimcSponge()

    let layers = []
    layers[0] = elements.slice()
    for (let level = 1; level <= levels; level++) {
        layers[level] = []
        for (let i = 0; i < Math.ceil(layers[level - 1].length / 2); i++) {
            layers[level][i] = mimc.F.toString(mimc.multiHash([
                layers[level - 1][i * 2],
                i * 2 + 1 < layers[level - 1].length ? layers[level - 1][i * 2 + 1] : zeros[level - 1]]))
        }
    }
    // console.log(layers)
    const root = layers[levels].length > 0 ? layers[levels][0] : zeros[levels - 1]
    console.log("root 1: ", root)
    let pathElements = []
    let pathIndices = []

    if (element) {
        let index = layers[0].findIndex(e => e === element)
        if (index === -1) {
            return false
        }
        console.log('idx: ' + index)
        for (let level = 0; level < levels; level++) {
            pathIndices[level] = index % 2
            pathElements[level] = (index ^ 1) < layers[level].length ? layers[level][index ^ 1] : zeros[level]
            index >>= 1
        }
        return {
            root: root,
            pathElements: pathElements.map((v) => v.toString()),
            pathIndices: pathIndices.map((v) => v.toString())
        }
    }
    return root
}

async function generateAndVerifyProof(commitments, commitment, mimc) {
    const rootAndPath = await calculateMerkleRootAndPath(20, commitments, mimc, commitment.commitment)
    console.log("got root and path")
    if (!rootAndPath) {
        return "commitment not found in tree"
    }
    console.log("proving...")
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
            nullifier: commitment.nullifier, secret: commitment.secret,
            pathElements: rootAndPath.pathElements, pathIndices: rootAndPath.pathIndices
        },

        "https://proof-files.vercel.app/giftcard.wasm", 
        "https://proof-files.vercel.app/giftcard_0001.zkey"    
    )
    console.log("proof success")
    const cd = convertCallData(await snarkjs.groth16.exportSolidityCallData(proof, publicSignals));
    return {
        nullifierHash: BigInt(publicSignals[0]),
        root: BigInt(publicSignals[1]),
        proof_a: BigInt(cd.a),
        proof_b: BigInt(cd.b),
        proof_c: BigInt(cd.c)
    }
}
// function getVerifierWASM() {
//     return loadWebAssembly().buffer
// 
module.exports = {generateAndVerifyProof};