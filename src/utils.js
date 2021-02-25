const eutil = require('ethereumjs-util')
const base58 = require('base58-encode');


    /**
     * Concatenates two given Arrays
     *
     * @param {Uint8Array} a First array to add
     * @param {Uint8Array} b Second array to add
     * @returns {Uint8Array}
     */
function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

module.exports = {
    /**
     * Generates the rsv value of the given signature
     *
     * @param {string} sign hexed string of signature (132 characters length)
     * @returns {UINT8Array} of 65 bytes string
     */
    generateSignature(sign){
        sign = eutil.fromRpcSig(sign);
        var r = base58(sign.r)
        // sign2arrays = concatTypedArrays(sign.r, sign.s)
        var newArray = new Uint8Array(1);
        newArray[0] = sign.v;
        sign = concatTypedArrays(sign.s, newArray)
        var sv = base58(sign)
        // console.log('signature after base58');
        // console.log(base58(sign));
        return [r, sv];
    },
    generateLink(link, text) {
        var linkTag = document.createElement('a');
        linkTag.appendChild(document.createTextNode(text));
        linkTag.role = "button";
        linkTag.className = "btn btn-success"
        linkTag.target = "_blank"
        linkTag.href = link
        return linkTag
    },
    generateError(text) {
        var error = document.createElement('p');
        error.className = "info-text alert alert-warning";
        error.appendChild(document.createTextNode(text));
        return error
    }


}
