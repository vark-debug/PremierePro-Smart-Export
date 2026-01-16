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
 * 文件版本号处理模块 - 智能检测和生成版本号
 * File Versioner Module - Intelligent version detection and generation
 */

const fs = require("uxp").storage.localFileSystem;
const ppro = require("premierepro");

/**
 * 从字符串中移除日期标记
 * @param {string} str - 输入字符串
 * @returns {string} 清理后的字符串
 */
function removeDateMarkers(str) {
  if (!str) return '';
  
  let cleaned = str;
  
  // 匹配各种日期格式并移除
  // 格式1: 1_11, 2_3, 12_25 等 (月_日)
  cleaned = cleaned.replace(/\b\d{1,2}_\d{1,2}\b/g, '');
  
  // 格式2: 2025-2-3, 2025-02-03, 2025.2.3, 2025.02.03 等 (年-月-日或年.月.日)
  cleaned = cleaned.replace(/\b\d{4}[-_.]\d{1,2}[-_.]\d{1,2}\b/g, '');
  
  // 格式3: 2025年8月19日, 2025年8月, 8月19日 等
  cleaned = cleaned.replace(/\b\d{1,4}年\d{1,2}月(\d{1,2}日)?\b/g, '');
  cleaned = cleaned.replace(/\b\d{1,2}月\d{1,2}日\b/g, '');
  
  // 格式4: 单独的年份 2025年
  cleaned = cleaned.replace(/\b\d{4}年\b/g, '');
  
  console.log(`[removeDateMarkers] 原始: "${str}" -> 清理后: "${cleaned}"`);
  
  return cleaned;
}

/**
 * 清理字符串头尾的符号
 * @param {string} str - 输入字符串
 * @returns {string} 清理后的字符串
 */
function trimSymbols(str) {
  if (!str) return '';
  
  // 移除头尾的空格
  let cleaned = str.trim();
  
  // 移除头尾的常见分隔符号（连字符、下划线、点、斜杠、括号等）
  cleaned = cleaned.replace(/^[-_.,/\\()（）【】\[\]]+/, '');
  cleaned = cleaned.replace(/[-_.,/\\()（）【】\[\]]+$/, '');
  
  // 再次trim，以防移除符号后留下空格
  cleaned = cleaned.trim();
  
  console.log(`[trimSymbols] 原始: "${str}" -> 清理后: "${cleaned}"`);
  
  return cleaned;
}

/**
 * 获取并清理项目名称
 * @returns {Promise<string>} 清理后的项目名称
 */
async function getCleanProjectName() {
  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      console.log('[getCleanProjectName] 没有活动项目');
      return '导出';
    }
    
    let projectName = project.name || '导出';
    console.log(`[getCleanProjectName] 原始项目名: "${projectName}"`);
    
    // 移除 .prproj 扩展名
    projectName = projectName.replace(/\.prproj$/i, '');
    
    // 移除日期标记
    projectName = removeDateMarkers(projectName);
    
    // 清理头尾符号
    projectName = trimSymbols(projectName);
    
    // 如果清理后为空，使用默认名称
    if (!projectName || projectName === '') {
      projectName = '导出';
    }
    
    console.log(`[getCleanProjectName] 最终项目名: "${projectName}"`);
    
    return projectName;
    
  } catch (error) {
    console.error('[getCleanProjectName] 错误:', error);
    return '导出';
  }
}

/**
 * 从文件名中提取版本号
 * @param {string} filename - 文件名
 * @returns {Object} 版本信息 {hasVersion, version, versionType, pattern}
 */
function extractVersionFromFilename(filename) {
  const result = {
    hasVersion: false,
    version: 0,
    versionType: null, // 'V' 或 '版'
    pattern: null,
    originalFilename: filename
  };
  
  // 移除文件扩展名
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // 匹配 V数字 格式 (V1, V2, V3, ...)
  const vPatternMatch = nameWithoutExt.match(/[Vv](\d+)/);
  if (vPatternMatch) {
    result.hasVersion = true;
    result.version = parseInt(vPatternMatch[1], 10);
    result.versionType = 'V';
    result.pattern = vPatternMatch[0];
    return result;
  }
  
  // 匹配中文版本格式 (第一版, 第二版, 第三版, ...)
  const chineseNumbers = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  };
  
  const chinesePatternMatch = nameWithoutExt.match(/第([一二三四五六七八九十]+)版/);
  if (chinesePatternMatch) {
    const chineseNum = chinesePatternMatch[1];
    const version = chineseNumbers[chineseNum] || 1;
    result.hasVersion = true;
    result.version = version;
    result.versionType = '版';
    result.pattern = chinesePatternMatch[0];
    return result;
  }
  
  return result;
}

/**
 * 生成新的版本号字符串
 * @param {number} version - 版本号
 * @param {string} versionType - 版本类型 ('V' 或 '版')
 * @returns {string} 新的版本号字符串
 */
function generateVersionString(version, versionType) {
  if (versionType === 'V') {
    return `V${version}`;
  } else if (versionType === '版') {
    const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (version <= 10) {
      return `第${chineseNumbers[version]}版`;
    } else {
      return `第${version}版`;
    }
  }
  return `V${version}`;
}

/**
 * 递归遍历文件夹获取所有视频文件
 * @param {Object} folder - 文件夹对象
 * @param {Array} videoFiles - 视频文件数组（用于收集结果）
 * @returns {Promise<void>}
 */
async function traverseFolder(folder, videoFiles) {
  try {
    console.log(`[traverseFolder] 遍历文件夹: ${folder.nativePath}`);
    
    const entries = await folder.getEntries();
    console.log(`[traverseFolder] 找到 ${entries.length} 个条目`);
    
    for (const entry of entries) {
      console.log(`[traverseFolder] 检查条目: ${entry.name}`);
      console.log(`  - isFolder: ${entry.isFolder}, isFile: ${entry.isFile}`);
      
      if (entry.isFolder) {
        // 递归遍历子文件夹
        console.log(`[traverseFolder] 递归进入子文件夹: ${entry.name}`);
        await traverseFolder(entry, videoFiles);
      } else if (entry.isFile) {
        // 检查是否为视频文件
        const lowerName = entry.name.toLowerCase();
        console.log(`[traverseFolder] 检查文件: ${entry.name}`);
        
        const ext = lowerName.match(/\.(mp4|mov|avi|mkv|mxf)$/);
        
        if (ext) {
          console.log(`[traverseFolder] ✓ 添加视频文件: ${entry.name}`);
          videoFiles.push(entry);
        } else {
          console.log(`[traverseFolder] ✗ 跳过非视频文件: ${entry.name}`);
        }
      }
    }
    
  } catch (error) {
    console.error(`[traverseFolder] 遍历文件夹出错:`, error);
    console.error(`[traverseFolder] 错误堆栈:`, error.stack);
  }
}

/**
 * 检测导出文件夹中的最新文件并生成新文件名
 * @param {Object} exportFolder - 导出文件夹对象
 * @param {string} bitrate - 码率 (如 "10mbps" 或 "35mbps")
 * @returns {Promise<Object>} 文件版本信息
 */
async function detectLatestVersionAndGenerateFilename(exportFolder, bitrate = "10mbps") {
  const result = {
    success: false,
    latestFile: null,
    latestFilename: '',
    hasExistingVersion: false,
    detectedVersion: 0,
    newVersion: 1,
    newFilename: '',
    baseFilename: '',
    error: null
  };
  
  try {
    console.log('=== 开始检测最新版本文件 ===');
    console.log(`码率: ${bitrate}`);
    
    if (!exportFolder) {
      result.error = "导出文件夹对象为空";
      console.log(result.error);
      return result;
    }
    
    console.log('导出文件夹对象:', exportFolder);
    console.log('导出文件夹路径:', exportFolder.nativePath);
    console.log('是否为文件夹:', exportFolder.isFolder);
    
    // 使用递归遍历获取所有视频文件
    console.log('开始递归遍历文件夹...');
    const videoFiles = [];
    await traverseFolder(exportFolder, videoFiles);
    
    console.log(`找到 ${videoFiles.length} 个视频文件`);
    
    // 打印所有找到的视频文件
    if (videoFiles.length > 0) {
      console.log('=== 找到的视频文件列表 ===');
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        console.log(`文件 ${i + 1}: ${file.name} (路径: ${file.nativePath})`);
      }
      console.log('=== 视频文件列表结束 ===');
    }
    
    if (videoFiles.length === 0) {
      // 没有现有文件，使用清理后的项目名称
      console.log('没有现有文件，使用清理后的项目名称');
      
      const projectName = await getCleanProjectName();
      
      // 根据编码类型选择文件扩展名
      let fileExtension = '.mp4';
      if (bitrate === 'prores422' || bitrate === 'prores444') {
        fileExtension = '.mov';
      }
      
      result.success = true;
      result.baseFilename = projectName;
      result.newVersion = 1;
      result.newFilename = `${projectName}_${bitrate}_V1${fileExtension}`;
      
      console.log(`基础文件名: ${projectName}`);
      console.log(`新文件名: ${result.newFilename}`);
      return result;
    }
    
    // 提取所有文件的版本信息
    console.log('=== 开始提取版本信息 ===');
    const filesWithVersions = [];
    
    for (const file of videoFiles) {
      const versionInfo = extractVersionFromFilename(file.name);
      console.log(`文件: ${file.name}`);
      console.log(`  版本信息: hasVersion=${versionInfo.hasVersion}, version=${versionInfo.version}, pattern=${versionInfo.pattern}`);
      
      if (versionInfo.hasVersion) {
        filesWithVersions.push({
          file: file,
          versionInfo: versionInfo
        });
        console.log(`  ✓ 有版本号，添加到版本列表`);
      } else {
        console.log(`  ✗ 无版本号，跳过`);
      }
    }
    
    console.log(`=== 版本信息提取完成，找到 ${filesWithVersions.length} 个有版本号的文件 ===`);
    
    if (filesWithVersions.length === 0) {
      // 所有文件都没有版本号，使用清理后的项目名称并添加 V1
      console.log('所有文件都没有版本号，使用项目名称并添加 V1');
      
      const projectName = await getCleanProjectName();
      
      // 根据编码类型选择文件扩展名
      let fileExtension = '.mp4';
      if (bitrate === 'prores422' || bitrate === 'prores444') {
        fileExtension = '.mov';
      }
      
      result.success = true;
      result.baseFilename = projectName;
      result.newVersion = 1;
      result.newFilename = `${projectName}_${bitrate}_V1${fileExtension}`;
      
      console.log(`基础文件名（来自项目名）: ${projectName}`);
      console.log(`新文件名: ${result.newFilename}`);
      return result;
    }
    
    // 按版本号大小排序，找到最大版本号
    filesWithVersions.sort((a, b) => b.versionInfo.version - a.versionInfo.version);
    
    console.log('=== 按版本号排序后的文件列表 ===');
    for (let i = 0; i < filesWithVersions.length; i++) {
      const item = filesWithVersions[i];
      console.log(`${i + 1}. ${item.file.name} - 版本: ${item.versionInfo.version}`);
    }
    console.log('=== 排序列表结束 ===');
    
    // 获取版本号最大的文件
    const latestFileWithVersion = filesWithVersions[0];
    const latestFile = latestFileWithVersion.file;
    const versionInfo = latestFileWithVersion.versionInfo;
    
    result.latestFile = latestFile;
    result.latestFilename = latestFile.name;
    result.hasExistingVersion = true;
    result.detectedVersion = versionInfo.version;
    result.newVersion = versionInfo.version + 1;
    
    console.log(`最新版本文件: ${result.latestFilename}`);
    console.log(`检测到版本: ${versionInfo.pattern} (${versionInfo.version})`);
    console.log(`新版本: ${result.newVersion}`);
    
    // 生成基础文件名（去除版本号和扩展名）
    let baseFilename = result.latestFilename.replace(/\.[^/.]+$/, ""); // 去除扩展名
    console.log(`[步骤1] 去除扩展名: "${baseFilename}"`);
    
    // 去除旧的版本号
    if (versionInfo.pattern) {
      baseFilename = baseFilename.replace(versionInfo.pattern, '').trim();
      console.log(`[步骤2] 去除版本号: "${baseFilename}"`);
    }
    
    // 去除可能存在的码率标记（包括 H.264 和 ProRes）
    baseFilename = baseFilename.replace(/_\d+mbps/i, '').trim();
    console.log(`[步骤3] 去除码率标记: "${baseFilename}"`);
    
    // 去除 ProRes 标记
    baseFilename = baseFilename.replace(/_prores422/i, '').trim();
    baseFilename = baseFilename.replace(/_prores444/i, '').trim();
    console.log(`[步骤3.1] 去除 ProRes 标记: "${baseFilename}"`);
    
    // 清理日期标记
    baseFilename = removeDateMarkers(baseFilename);
    console.log(`[步骤4] 清理日期标记: "${baseFilename}"`);
    
    // 去除末尾的连字符或下划线
    baseFilename = trimSymbols(baseFilename);
    console.log(`[步骤5] 清理头尾符号: "${baseFilename}"`);
    
    // 如果清理后为空，使用项目名称
    if (!baseFilename || baseFilename === '') {
      console.log('[警告] 基础文件名清理后为空，使用项目名称');
      baseFilename = await getCleanProjectName();
    }
    
    result.baseFilename = baseFilename;
    
    // 根据编码类型选择文件扩展名
    let fileExtension = '.mp4';  // 默认 H.264 使用 .mp4
    if (bitrate === 'prores422' || bitrate === 'prores444') {
      fileExtension = '.mov';  // ProRes 使用 .mov
    }
    console.log(`[步骤6] 选择文件扩展名: ${fileExtension} (编码: ${bitrate})`);
    
    // 生成新文件名
    const newVersionString = generateVersionString(result.newVersion, versionInfo.versionType);
    result.newFilename = `${baseFilename}_${bitrate}_${newVersionString}${fileExtension}`;
    
    console.log(`基础文件名（最终）: ${baseFilename}`);
    console.log(`新文件名: ${result.newFilename}`)
    
    result.success = true;
    console.log('=== 检测最新版本文件完成 ===');
    
  } catch (error) {
    console.error('Error detecting version:', error);
    console.error('Error stack:', error.stack);
    result.error = error.message || '检测版本时发生错误';
  }
  
  return result;
}

/**
 * 格式化版本信息用于显示
 * @param {Object} versionResult - 版本结果对象
 * @returns {String} 格式化的 HTML 字符串
 */
function formatVersionInfoForDisplay(versionResult) {
  if (!versionResult.success) {
    return `<span style="color:red">检测失败: ${versionResult.error}</span>`;
  }
  
  let html = `<strong>版本信息</strong><br />`;
  
  if (versionResult.latestFilename) {
    html += `最新文件: <span style="color:#888;">${versionResult.latestFilename}</span><br />`;
  }
  
  if (versionResult.hasExistingVersion) {
    html += `检测到版本: <strong>V${versionResult.detectedVersion}</strong><br />`;
  } else {
    html += `检测到版本: <span style="color:#888;">无</span><br />`;
  }
  
  html += `新版本: <strong style="color:#00aa00;">V${versionResult.newVersion}</strong><br />`;
  html += `新文件名: <span style="color:#0066cc;">${versionResult.newFilename}</span><br />`;
  
  return html;
}

// 导出模块函数
module.exports = {
  extractVersionFromFilename,
  generateVersionString,
  detectLatestVersionAndGenerateFilename,
  formatVersionInfoForDisplay,
  removeDateMarkers,
  trimSymbols,
  getCleanProjectName,
  traverseFolder
};
