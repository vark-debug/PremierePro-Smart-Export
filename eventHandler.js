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
 * 事件处理器模块 - 处理所有 UI 事件和触发逻辑
 * Event Handler Module - Handle all UI events and workflow orchestration
 */

const modules = require("./moduleManager");

/**
 * UI 日志函数 - 在插件面板中显示消息
 * @param {string} msg - 消息内容
 * @param {string} color - 文字颜色（可选）
 */
function log(msg, color) {
  const pluginBody = document.getElementById("plugin-body");
  if (pluginBody) {
    pluginBody.innerHTML += color
      ? `<span style='color:${color}'>${msg}</span><br />`
      : `${msg}<br />`;
  }
  console.log(msg);
}

/**
 * 清空日志区域
 */
function clearLog() {
  const pluginBody = document.getElementById("plugin-body");
  if (pluginBody) {
    pluginBody.innerHTML = "";
  }
}

/**
 * 测试功能1: 获取项目位置
 */
async function testProjectLocation() {
  log("--- 测试: 获取项目位置 ---", "#0066cc");
  
  const result = await modules.projectLocationDetector.getProjectLocation();
  const formattedOutput = modules.projectLocationDetector.formatProjectLocationForDisplay(result);
  
  log(formattedOutput);
  log(""); // 空行
  
  return result;
}

/**
 * 测试功能2: 获取/创建导出文件夹
 */
async function testExportFolder() {
  log("--- 测试: 获取/创建导出文件夹 ---", "#0066cc");
  
  // 先获取项目位置
  const projectResult = await modules.projectLocationDetector.getProjectLocation();
  
  if (!projectResult.success) {
    log(`无法获取项目位置: ${projectResult.error}`, "red");
    log(""); // 空行
    return null;
  }
  
  // 获取或创建导出文件夹（传递完整项目路径）
  const folderResult = await modules.exportFolderManager.getOrCreateExportFolder(
    projectResult.projectPath
  );
  
  const formattedOutput = modules.exportFolderManager.formatExportFolderForDisplay(folderResult);
  log(formattedOutput);
  log(""); // 空行
  
  return folderResult;
}

/**
 * 测试功能3: 检测分辨率
 */
async function testResolution() {
  log("--- 测试: 检测分辨率 ---", "#0066cc");
  
  const result = await modules.resolutionDetector.detectResolution();
  const formattedOutput = modules.resolutionDetector.formatResolutionForDisplay(result);
  
  log(formattedOutput);
  log(""); // 空行
  
  return result;
}

/**
 * 测试功能4: 检测版本并生成文件名
 */
async function testVersionDetection() {
  log("--- 测试: 检测版本并生成文件名 ---", "#0066cc");
  
  // 先获取项目位置
  const projectResult = await modules.projectLocationDetector.getProjectLocation();
  
  if (!projectResult.success) {
    log(`无法获取项目位置: ${projectResult.error}`, "red");
    log(""); // 空行
    return null;
  }
  
  // 获取导出文件夹
  const folderResult = await modules.exportFolderManager.getOrCreateExportFolder(
    projectResult.projectPath  // 传递完整项目路径，而不是 projectDirectory
  );
  
  if (!folderResult.success) {
    log(`无法获取导出文件夹: ${folderResult.error}`, "red");
    log(""); // 空行
    return null;
  }
  
  // 检测分辨率以确定码率
  const resolutionResult = await modules.resolutionDetector.detectResolution();
  const bitrate = resolutionResult.success ? resolutionResult.bitrate : "10mbps";
  
  // 检测版本并生成文件名
  const versionResult = await modules.fileVersioner.detectLatestVersionAndGenerateFilename(
    folderResult.exportFolder,
    bitrate
  );
  
  const formattedOutput = modules.fileVersioner.formatVersionInfoForDisplay(versionResult);
  log(formattedOutput);
  log(""); // 空行
  
  return versionResult;
}

/**
 * 测试完整工作流
 */
async function testCompleteWorkflow() {
  log("开始导出...", "#0078D4");
  log("");
  
  try {
    // 步骤1: 获取项目位置
    const projectResult = await modules.projectLocationDetector.getProjectLocation();
    
    if (!projectResult.success) {
      log(`❌ 错误: ${projectResult.error}`, "#FF5A5A");
      return;
    }
    
    // 步骤2: 获取/创建导出文件夹
    const folderResult = await modules.exportFolderManager.getOrCreateExportFolder(
      projectResult.projectPath
    );
    
    if (!folderResult.success) {
      log(`❌ 错误: ${folderResult.error}`, "#FF5A5A");
      return;
    }
    
    // 步骤3: 检测分辨率
    const resolutionResult = await modules.resolutionDetector.detectResolution();
    
    if (!resolutionResult.success) {
      log(`❌ 错误: ${resolutionResult.error}`, "#FF5A5A");
      return;
    }
    
    // 步骤3.5: 检查用户选择的导出格式
    const radioGroup = document.getElementById('export-format-group');
    const selectedFormat = radioGroup ? radioGroup.selected : null;
    
    let finalBitrate = resolutionResult.bitrate;
    let finalPresetName = resolutionResult.recommendedPreset;
    
    if (selectedFormat === "prores422") {
      finalBitrate = "prores422";
      finalPresetName = "ProRes 422 (数字中间片)";
      log(`导出格式: ${finalPresetName}`, "#888");
    } else if (selectedFormat === "prores444") {
      finalBitrate = "prores444";
      finalPresetName = "ProRes 444 (带通道)";
      log(`导出格式: ${finalPresetName}`, "#888");
    } else {
      log(`导出格式: ${finalPresetName}`, "#888");
    }
    
    // 步骤4: 检测版本并生成文件名
    const versionResult = await modules.fileVersioner.detectLatestVersionAndGenerateFilename(
      folderResult.exportFolder,
      finalBitrate
    );
    
    if (!versionResult.success) {
      log(`❌ 错误: ${versionResult.error}`, "#FF5A5A");
      return;
    }
    
    log(`正在导出: ${versionResult.newFilename}`, "#0078D4");
    log("请稍候...", "#888");
    
    // 步骤5: 执行导出
    const exportResult = await modules.sequenceExporter.exportCurrentSequence(
      folderResult.exportFolder,
      versionResult.newFilename,
      finalBitrate
    );
    
    if (!exportResult.success) {
      log(`❌ 导出失败: ${exportResult.error}`, "#FF5A5A");
      return;
    }
    
    // 导出成功
    log("");
    log("✅ 导出成功！", "#00D084");
    log("");
    log("导出文件位置:", "#888");
    
    // 创建Spectrum样式的文件夹路径按钮
    const exportPath = exportResult.exportPath;
    const fileName = exportPath.split(/[/\\]/).pop(); // 提取文件名
    
    // 提取文件夹路径
    const lastSlash = Math.max(
      exportPath.lastIndexOf('/'),
      exportPath.lastIndexOf('\\')
    );
    const folderPath = exportPath.substring(0, lastSlash);
    
    const pathButton = document.createElement('sp-button');
    pathButton.setAttribute('variant', 'secondary');
    pathButton.style.width = '100%';
    pathButton.style.marginTop = '8px';
    pathButton.textContent = `📁 打开导出文件夹`;
    pathButton.title = `点击打开导出文件夹\n文件: ${fileName}\n文件夹: ${folderPath}`;
    
    pathButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      log("", "");
      log("=== 打开导出文件夹 ===", "#0078D4");
      log(`文件夹路径: ${folderPath}`, "#888");
      
      try {
        log("正在打开文件夹...", "#888");
        
        // 使用scriptRunner模块打开文件夹（不选中文件）
        const result = await modules.scriptRunner.openFolder(folderPath);
        
        if (result.success) {
          log("✅ 导出文件夹已打开！", "#00D084");
        } else {
          log(`❌ 打开失败: ${result.error}`, "#FF5A5A");
        }
      } catch (error) {
        console.error('[ERROR] 异常:', error);
        console.error('[ERROR] 错误堆栈:', error.stack);
        log(`❌ 发生异常: ${error.message}`, "#FF5A5A");
      }
      
      log("=== 结束 ===", "#0078D4");
      log("", "");
    });
    
    const pluginBody = document.getElementById('plugin-body');
    pluginBody.appendChild(pathButton);
    pluginBody.appendChild(document.createElement('br'));
    
  } catch (error) {
    log(`❌ 发生错误: ${error.message}`, "#FF5A5A");
    console.error(error);
  }
}

/**
 * 初始化事件监听器
 */
function initializeEventHandlers() {
  // 原有的按钮保持兼容
  const btnPopulate = document.querySelector("#btnPopulate");
  if (btnPopulate) {
    btnPopulate.addEventListener("click", testProjectLocation);
  }
  
  const clearBtn = document.querySelector("#clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearLog);
  }
  
  // 主导出按钮
  const btnExport = document.querySelector("#btn-export");
  if (btnExport) {
    btnExport.addEventListener("click", testCompleteWorkflow);
  }
}

// 导出模块函数
module.exports = {
  initializeEventHandlers,
  log,
  clearLog
};
