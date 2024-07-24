pragma circom 2.0.0;

include "./utils/mimc5sponge.circom";
include "./commitmentHasher.circom";

template Check() {
    signal input nullifierHash;
    signal input recipient;

    signal input secret[256];
    signal input nullifier[256];
    
    component cHasher = CommitmentHasher();
    cHasher.secret <== secret;
    cHasher.nullifier <== nullifier;
    cHasher.nullifierHash === nullifierHash;

    // add recipient in the proof
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
}

component main {public [nullifierHash, recipient]} = Check();