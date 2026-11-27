# System architecture

SignalLab is a static browser instrument. Four workspaces and a dashboard share one sample record; numerical kernels can also be imported in Node independently of the DOM.

![System layers](../../assets/diagrams/architecture.svg)

## 1. Components

```mermaid
flowchart LR
    U[Browser controls] --> C[UI controller]
    I[Local audio or synthetic input] --> C
    C --> D[DSP core: FFT and STFT]
    C --> A[Advanced DSP: SOS and IFFT]
    A --> D
    D --> R[Shared numerical record]
    A --> R
    R --> V[Active workspace and Canvas]
    L[Academy UI] --> E[Fixed experiment engine]
    E --> D
    E --> A
    E --> M[Markdown report]
    W[Workspace navigation and theme] --> V
```

| Layer | Files | Contract |
| --- | --- | --- |
| Numerical core | src/dsp/dsp.js | Sample arrays, spectra, metrics and pure numerical functions |
| Advanced DSP | src/dsp/advanced.js | Filter coefficients, response, roots, reconstruction and convolution |
| Academy | src/academy/academy.js | Fixed IDs, presets, expected values, predictions and report |
| UI | src/ui/app.js, academy-ui.js, workspace.js | Input lifecycle, DOM events, rendering, navigation and progress |
| Presentation | web/index.html, src/styles/workspace.css | Controls, layout, themes and canvases |

Runtime scripts use an ordered classic-script interface; numerical modules expose CommonJS exports for testing. This is not a framework-based application or worker-based streaming pipeline.

## 2. Signal processing sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as App controller
    participant DSP as DSP core
    participant Adv as Advanced DSP
    participant Canvas as Active workspace
    User->>UI: Change waveform or filter
    UI->>DSP: Generate or read sample record
    UI->>Adv: Design and apply SOS
    UI->>DSP: Input and filtered spectra
    UI->>UI: Store latest record and metrics
    alt Analyzer
        UI->>DSP: STFT and phase data
    else Filter design
        UI->>Adv: Response and pole-zero roots
    else Mathematics
        UI->>Adv: Reconstruction and convolution
    end
    UI->>Canvas: Draw active instrument
```

Common waveform and spectrum calculations still run; V2.0 avoids inactive advanced calculations. No hard real-time scheduling is claimed.

## 3. Input lifecycle

```mermaid
stateDiagram-v2
    [*] --> Synthetic
    Synthetic --> PendingMicrophone: start request
    PendingMicrophone --> Microphone: permission and device ready
    PendingMicrophone --> Synthetic: denied or cancelled
    Synthetic --> PendingFile: select audio
    PendingFile --> ImportedAudio: decode succeeds
    PendingFile --> Synthetic: rejected or cancelled
    Microphone --> Synthetic: stop or reset
    ImportedAudio --> Synthetic: clear or reset
    Microphone --> PendingFile: import
    ImportedAudio --> PendingMicrophone: start
```

Conceptual state model, not a separate state-machine library. Epoch/token checks invalidate stale asynchronous requests; microphone tracks are released on stop and pagehide.

## 4. Build and verification

```mermaid
flowchart LR
    A[web/index.html and source modules] --> B[Deterministic Node build]
    B --> C[Portable HTML]
    A --> D[Node regression and layout tests]
    C --> E[Hosted Chromium: portable]
    A --> F[Hosted Chromium: modular]
    E --> G[UI screenshots and logs]
    F --> G
    D --> H[PR quality gate]
    G --> H
```

CI uploads the portable artifact and screenshots. GitHub Pages remains an owner-controlled step.
