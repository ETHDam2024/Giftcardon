const { buildMimcSponge } = require("circomlibjs")
// const fs = require("fs")
const ethers = require("ethers")
const snarkjs = require("snarkjs")
// const loadWebAssembly = require("./Verifier");
// const { Storage} = require("@google-cloud/storage")

const zeros = [
    '21663839004416932945382355908790599225266501822907911457504978515578255421292',
    '16923532097304556005972200564242292693309333953544141029519619077135960040221',
    '7833458610320835472520144237082236871909694928684820466656733259024982655488',
    '14506027710748750947258687001455876266559341618222612722926156490737302846427',
    '4766583705360062980279572762279781527342845808161105063909171241304075622345',
    '16640205414190175414380077665118269450294358858897019640557533278896634808665',
    '13024477302430254842915163302704885770955784224100349847438808884122720088412',
    '11345696205391376769769683860277269518617256738724086786512014734609753488820',
    '17235543131546745471991808272245772046758360534180976603221801364506032471936',
    '155962837046691114236524362966874066300454611955781275944230309195800494087',
    '14030416097908897320437553787826300082392928432242046897689557706485311282736',
    '12626316503845421241020584259526236205728737442715389902276517188414400172517',
    '6729873933803351171051407921027021443029157982378522227479748669930764447503',
    '12963910739953248305308691828220784129233893953613908022664851984069510335421',
    '8697310796973811813791996651816817650608143394255750603240183429036696711432',
    '9001816533475173848300051969191408053495003693097546138634479732228054209462',
    '13882856022500117449912597249521445907860641470008251408376408693167665584212',
    '6167697920744083294431071781953545901493956884412099107903554924846764168938',
    '16572499860108808790864031418434474032816278079272694833180094335573354127261',
    '11544818037702067293688063426012553693851444915243122674915303779243865603077',
    '18926336163373752588529320804722226672465218465546337267825102089394393880276'
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

async function calculateMerkleRootAndPath(levels, elements, element = undefined) {
    const capacity = 2 ** levels
    if (elements.length > capacity) throw new Error('Tree is full')
    const mimc = await buildMimcSponge()

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
const ZERO_VALUE = '21663839004416932945382355908790599225266501822907911457504978515578255421292' // = keccak256("tornado") % FIELD_SIZE
async function generateAndVerifyProof(commitments, commitment) {
    const mimc = await buildMimcSponge()
    const rootAndPath = await calculateMerkleRootAndPath(20, commitments, commitment.commitment)
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
    const cd = convertCallData(await snarkjs.groth16.exportSolidityCallData(proof, publicSignals));
    return {
        nullifierHash: publicSignals[0],
        root: publicSignals[1],
        proof_a: cd.a,
        proof_b: cd.b,
        proof_c: cd.c
    }
}
// function getVerifierWASM() {
//     return loadWebAssembly().buffer
// }