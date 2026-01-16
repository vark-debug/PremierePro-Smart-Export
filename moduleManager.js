/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

/**
 * 模块管理器 - 统一管理所有功能模块的导入
 * Module Manager - Centralized module import management
 */

// Import all feature modules
const projectLocationDetector = require("./modules/projectLocationDetector");
const exportFolderManager = require("./modules/exportFolderManager");
const resolutionDetector = require("./modules/resolutionDetector");
const fileVersioner = require("./modules/fileVersioner");
const sequenceExporter = require("./modules/sequenceExporter");
const scriptRunner = require("./modules/scriptRunner");
const fileSystemHelper = require("./modules/FileSystemHelper");

// Export all modules as a single object
module.exports = {
  projectLocationDetector,
  exportFolderManager,
  resolutionDetector,
  fileVersioner,
  sequenceExporter,
  scriptRunner,
  fileSystemHelper
};
