# Security and privacy

SignalLab is client-side educational software. No backend, accounts, analytics or network API. Local audio is decoded in the browser; microphone access requires explicit permission. Do not upload private audio or personal data in issues or fixtures.

Report suspected vulnerabilities privately to the repository owner. Include commit, reproduction conditions and impact without private audio or credentials. This project has had a targeted code review, not a formal security audit. Encoded file limits and post-decode checks cannot fully prevent decoder memory pressure. Browser support and physical devices vary. No deployment or license is implied.

## Audio input controls and threat model

Encoded files must be nonempty and at most 25 MiB. Only one local decode may be in flight; a reset invalidates its token, but the gate remains occupied until the actual decode settles and its AudioContext closes. Decoded buffers are checked before downmix: at most 600 seconds, 8 channels and 30 million total channel samples; finite samples and matching channel lengths are required. These are application limits, not sandboxing or a pre-decode memory guarantee. The browser decoder can allocate before validation; malformed or compressed audio can still cause resource pressure. A disconnected microphone track returns to synthetic mode; stale permission requests remain token-guarded. Reset invalidates plot keys and releases the previous sample record. Automated browser checks use synthetic devices and a malformed fixture, not hostile codec fuzzing or physical hardware.

No network upload is implemented. The repeated synthetic browser test checks for external HTTP/HTTPS/WebSocket requests; that is evidence only for the tested path, not an exhaustive network/privacy audit.
