# Quick Export - Premiere Pro UXP Plugin

![Version](https://img.shields.io/badge/version-1.0.1-blue) ![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.6.3%2B-purple) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)

One-click export plugin for Premiere Pro sequences with intelligent preset management, output folder handling, and smart file versioning.

## 📦 Version Information

**Current Version**: V1.0.1 (2026-01-21)

### 🆕 What's New in V1.0.1

#### New Features
- ✨ **Custom Project Name**: Modify project name before export while maintaining version continuity
- 🎨 **Color Grading Status**: New color grading status selector (Graded/Ungraded)
  - Auto-detects existing files' grading status and syncs to UI
  - Recognizes markers: `已调色`, `调色`, `graded`, `cc`, etc.
  - Automatically appends `_已调色` marker to export filename
- 📊 **Streamlined UI**: Removed large log area, replaced with single-line status display
  - Real-time display: Project Name + Bitrate + Version + Grading Status
  - Cleaner, more professional UI layout

#### Improvements
- 🔄 Quick refresh button to update version info instantly
- 📁 Optimized export path display for direct output location view
- 🎯 More compact UI layout for improved efficiency

## 💡 Design Philosophy

This is an **opinionated export plugin** based on my personal editing workflow. It doesn't aim for infinite configurability, but rather automates a proven, efficient workflow.

### Core Concept

This plugin is a **productization of "my workflow"**. I've solidified the most common and reliable export logic from my high-quality video delivery process. It may not be a perfect fit for everyone, but if our workflows are similar, you'll find it remarkably smooth.

---

## ✨ Key Features

### 🎯 One-Click Intelligent Export
- **Automatic Preset Selection**: Automatically chooses appropriate export presets based on sequence resolution
  - 4K+ (long edge ≥ 3840px): Uses 48Mbps H.264 high-quality preset
  - 1080p and below: Uses 10Mbps H.264 standard preset
- **Multiple Format Support**:
  - H.264 (default) - Universal compatibility format
  - ProRes 422 - Digital intermediate
  - ProRes 444 - With Alpha channel

### 📁 Intelligent File Management
- **Auto-create Export Folder**: Automatically creates an "Export" folder in the parent directory of the project folder
- **Smart Version Control**: Automatically detects and increments existing file versions
  - Recognizes `V1`, `V2`, `V3...` format (unlimited)
  - Recognizes `第一版`, `第二版`, `第三版...` format (Chinese version numbering, supports up to 第十版/10th version)
  - Auto-generates new version filenames with bitrate suffix
- **Naming Example**:
  ```
  Existing file: ProjectName-V3.mp4
  New export: ProjectName_10mbps_V4.mp4
  With grading: ProjectName_10mbps_V5_已调色.mp4
  ```
- **Custom Project Name**: Modify project name before export while version numbering continues automatically
- **Color Grading Status** (🆕 V1.0.1):
  - Manually select current export's grading status (Graded/Ungraded)
  - Auto-detects existing files' grading markers and syncs to UI
  - Automatically appends `_已调色` marker to filename for easy delivery stage identification

### 🖱️ Convenient Operations
- **Single-Line Status Display** (🆕 V1.0.1): Real-time display of project name, bitrate, version, and grading status at top
- **Quick Refresh** (🆕 V1.0.1): Instantly refresh version info and grading status without reloading plugin
- **One-Click Open Export Folder**: Quickly access file location after export completion
- **Cross-Platform Support**: Full support for Mac (Finder) and Windows (Explorer)

## 🚀 Installation & Usage

### Prerequisites
- Adobe Premiere Pro 25.6.3 or higher
- UXP Developer Tools (UDT)

### Installation Steps

#### Method 1: Use Pre-built Plugin Package (Recommended)

1. **Install Plugin Package**
   - Double-click the `快速导出.ccx` file in the root directory
   - Or in Premiere Pro: Extensions > Manage Extensions > Install
   - **⚠️ Note**: The `.ccx` plugin package has not been fully tested. Developer mode is recommended for initial use.

#### Method 2: Developer Mode Loading

1. **Download Plugin**
   ```bash
   git clone <repository-url>
   cd Test-hyor2v
   ```

2. **Load into Premiere Pro**
   - Open **UXP Developer Tools** application
   - Click "Add Plugin"
   - Select the `manifest.json` file in the plugin directory
   - Click "Load"

3. **Access in Premiere Pro**
   - Menu: Window > UXP Plugins > 快速导出 (Quick Export)

## 📖 User Guide

1. **Open Project**: Ensure your Premiere Pro project is saved
2. **Select Sequence**: Activate the sequence you want to export
3. **Customize Name** (Optional): Modify project name in the input field if needed
4. **Choose Format**: Select export format in the plugin panel (default H.264)
5. **Set Grading Status** (🆕 V1.0.1): Choose whether the export is color graded or ungraded
6. **Start Export**: Click the "Start Export" button
7. **View Results**: After export completion, click "Open Export Folder" button to view files

## 🗂️ Project Structure

```
├── 快速导出.ccx            # Pre-built plugin package (⚠️ Not fully tested)
├── index.html              # Plugin UI interface
├── main.js                 # Plugin entry point and theme management
├── eventHandler.js         # UI event handling and workflow orchestration
├── moduleManager.js        # Module import management
├── manifest.json           # Plugin configuration file
├── style.css               # Stylesheet
├── modules/                # Feature modules
│   ├── projectLocationDetector.js   # Project location detection
│   ├── exportFolderManager.js       # Export folder management
│   ├── resolutionDetector.js        # Resolution detection
│   ├── fileVersioner.js             # File version control
│   ├── sequenceExporter.js          # Sequence export
│   ├── scriptRunner.js              # Folder opening utility
│   └── FileSystemHelper.js          # File system helper
└── epr/                    # Export preset files
    ├── h264匹配帧10mbps.epr
    ├── h264匹配帧48mbps.epr
    ├── ProRes 422.epr
    └── ProRes 444.epr
```

## 🔧 Technical Features

- **Pure JavaScript**: No build tools or frameworks required
- **Modular Design**: Clear module separation for easy maintenance and extension
- **UXP API**: Uses the latest Adobe UXP platform API
- **Cross-Platform**: Automatic path handling adaptation for Mac and Windows (not yet tested but theoretically supported)
- **Error Handling**: Comprehensive error catching with user-friendly prompts

## 🐛 Troubleshooting

### Plugin Won't Load
- Ensure Premiere Pro version ≥ 25.6.3
- Click "Reload" in UDT to reload the plugin

### Export Failure
- Ensure project is saved (project must have a file path)
- Check if sequence is active
- View console logs for detailed error information

### Cannot Open Folder
- Check if `manifest.json` contains `""` in `launchProcess.extensions`
- Mac users: Ensure system allows folder access permissions

### macOS Known Issues
- **Authorization Dialog**: When opening export folders in different paths for the first time, Premiere Pro will display an authorization dialog requesting access permission. This is normal Adobe Premiere Pro security behavior. The path will be remembered after clicking "Allow".

## ⚠️ Testing Status

- ✅ **macOS**: Fully tested, functioning normally (with above mentioned authorization dialog issue)
- ✅ **Windows**: Fully tested, functioning normally
- ⚠️ **CCX Plugin Package**: Built but not fully tested, developer mode loading recommended

## 📝 Development Notes

### Core Workflow

1. **Project Detection** (`projectLocationDetector`) - Get project file path
2. **Folder Management** (`exportFolderManager`) - Create/check export folder
3. **Resolution Detection** (`resolutionDetector`) - Analyze sequence resolution
4. **Version Detection** (`fileVersioner`) - Scan existing file versions
5. **Sequence Export** (`sequenceExporter`) - Execute export operation
6. **Folder Opening** (`scriptRunner`) - Open export location in system

### Adding New Export Presets

1. Configure export settings in Premiere Pro
2. Export as `.epr` file
3. Place the file in the `epr/` directory
4. Add preset mapping in `sequenceExporter.js`

**⚠️ Encoder Limitations**:
- ✅ **Verified Working**: H.264, ProRes 422, ProRes 444
- ❌ **Not Supported**: HEVC/H.265 - Premiere Pro UXP API currently does not support HEVC encoder export presets
- Recommended to use H.264 for universal format, ProRes for high-quality/intermediate format

## 📄 License

Adobe Confidential - Copyright 2025 Adobe

## 🙋 Support

For questions or suggestions, please refer to the project documentation or submit an Issue.
