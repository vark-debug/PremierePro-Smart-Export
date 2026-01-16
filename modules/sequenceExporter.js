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
 * 序列导出模块 - 自动导出当前序列
 * Sequence Exporter Module - Automatically export current sequence
 */

const ppro = require("premierepro");
const fs = require("uxp").storage.localFileSystem;

/**
 * 导出当前序列
 * @param {Object} exportFolder - 导出文件夹对象
 * @param {string} filename - 导出文件名（包含扩展名）
 * @param {string} presetType - 预设类型 ("10mbps", "35mbps", "prores444")
 * @returns {Promise<Object>} 导出结果
 */
async function exportCurrentSequence(exportFolder, filename, presetType = "10mbps") {
  const result = {
    success: false,
    exportPath: '',
    presetUsed: '',
    error: null
  };
  
  try {
    console.log('=== 开始导出序列 ===');
    console.log(`导出文件夹: ${exportFolder.nativePath}`);
    console.log(`文件名: ${filename}`);
    console.log(`预设类型: ${presetType}`);
    
    // 检查 ppro 对象和 Constants
    console.log('[调试] ppro 对象:', ppro);
    console.log('[调试] ppro.Constants:', ppro.Constants);
    console.log('[调试] ppro.Constants.ExportType:', ppro.Constants ? ppro.Constants.ExportType : 'Constants undefined');
    console.log('[调试] ppro.Constants.ExportType.IMMEDIATELY:', ppro.Constants && ppro.Constants.ExportType ? ppro.Constants.ExportType.IMMEDIATELY : 'ExportType undefined');
    
    // 1. 获取当前活动项目和序列
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      result.error = "没有打开的项目";
      console.log(result.error);
      return result;
    }
    
    const sequence = await project.getActiveSequence();
    if (!sequence) {
      result.error = "没有活动的序列";
      console.log(result.error);
      return result;
    }
    
    console.log(`活动序列: ${sequence.name}`);
    
    // 2. 确定预设文件路径
    const presetMap = {
      "10mbps": "h264匹配帧10mbps.epr",
      "48mbps": "h264匹配帧48mbps.epr",
      "prores422": "ProRes 422.epr",
      "prores444": "ProRes 444.epr"
    };
    
    const presetFilename = presetMap[presetType] || presetMap["10mbps"];
    console.log(`[步骤2] 预设映射完成`);
    console.log(`  请求的预设类型: ${presetType}`);
    console.log(`  选择的预设文件名: ${presetFilename}`);
    console.log(`  预设映射表:`, presetMap);
    
    // 获取插件根目录路径
    console.log(`[步骤2.1] 获取插件根目录...`);
    const pluginFolder = await fs.getPluginFolder();
    console.log(`  插件根目录: ${pluginFolder.nativePath}`);
    
    console.log(`[步骤2.2] 查找 epr 文件夹...`);
    const eprFolder = await pluginFolder.getEntry("epr");
    console.log(`  epr 文件夹路径: ${eprFolder.nativePath}`);
    console.log(`  epr 是否为文件夹: ${eprFolder.isFolder}`);
    
    console.log(`[步骤2.3] 查找预设文件: ${presetFilename}...`);
    const presetFile = await eprFolder.getEntry(presetFilename);
    console.log(`  预设文件对象:`, presetFile);
    console.log(`  预设文件是否为文件: ${presetFile ? presetFile.isFile : 'null'}`);
    
    if (!presetFile || !presetFile.isFile) {
      result.error = `预设文件不存在: ${presetFilename}`;
      console.log(result.error);
      return result;
    }
    
    const presetPath = presetFile.nativePath;
    console.log(`[步骤2.4] 预设文件路径获取成功`);
    console.log(`  完整路径: ${presetPath}`);
    
    result.presetUsed = presetFilename;
    
    // 3. 构建完整的导出路径
    console.log(`[步骤3] 构建导出路径`);
    console.log(`  导出文件夹: ${exportFolder.nativePath}`);
    console.log(`  文件名: ${filename}`);
    
    // 跨平台路径分隔符：Mac 使用 / ，Windows 使用 \
    const separator = exportFolder.nativePath.includes('\\') ? '\\' : '/';
    const exportPath = exportFolder.nativePath + separator + filename;
    console.log(`  路径分隔符: ${separator}`);
    console.log(`  完整导出路径: ${exportPath}`);
    
    result.exportPath = exportPath;
    
    // 4. 执行导出
    console.log('[步骤4] 准备执行导出');
    console.log(`  序列名称: ${sequence.name}`);
    console.log(`  导出路径: ${exportPath}`);
    console.log(`  预设路径: ${presetPath}`);
    console.log(`  导出类型: ppro.Constants.ExportType.IMMEDIATELY`);
    
    console.log('[步骤4.1] 获取编码器管理器...');
    const encoder = await ppro.EncoderManager.getManager();
    console.log('  编码器管理器获取成功:', encoder);
    console.log('  编码器管理器类型:', typeof encoder);
    
    console.log('[步骤4.2] 准备调用 encoder.exportSequence');
    console.log('  参数1 - sequence:', sequence);
    console.log('  参数1 - sequence.name:', sequence.name);
    console.log('  参数1 - sequence type:', typeof sequence);
    
    const exportType = ppro.Constants.ExportType.IMMEDIATELY;
    console.log('  参数2 - ExportType:', exportType);
    console.log('  参数2 - ExportType type:', typeof exportType);
    console.log('  参数2 - ExportType value:', JSON.stringify(exportType));
    
    console.log('  参数3 - exportPath:', exportPath);
    console.log('  参数3 - exportPath type:', typeof exportPath);
    
    console.log('  参数4 - presetPath:', presetPath);
    console.log('  参数4 - presetPath type:', typeof presetPath);
    
    console.log('  encoder.exportSequence 方法:', encoder.exportSequence);
    console.log('  encoder.exportSequence 类型:', typeof encoder.exportSequence);
    
    try {
      // API签名: exportSequence(sequence, exportType, outputFile?, presetFile?, exportFull?)
      // 参考官方示例：必须传递预设文件参数
      console.log('[步骤4.3] ========== CALLING encoder.exportSequence() ==========');
      console.log('[步骤4.3] Function parameters:');
      console.log('  - sequence:', { name: sequence.name, type: typeof sequence });
      console.log('  - exportType:', exportType, `(type: ${typeof exportType})`);
      console.log('  - exportPath:', exportPath);
      console.log('  - presetFile:', presetPath);
      console.log('[步骤4.3] About to call encoder.exportSequence()...');
      
      const timeBefore = new Date().toISOString();
      console.log(`[步骤4.3] Time before call: ${timeBefore}`);
      
      const exportSuccess = await encoder.exportSequence(
        sequence,
        exportType,  // 使用变量，方便调试
        exportPath,  // 导出文件路径
        presetPath   // 预设文件路径 - 官方示例证明必须传递此参数
      );
      
      const timeAfter = new Date().toISOString();
      console.log(`[步骤4.3] Time after call: ${timeAfter}`);
      console.log(`[步骤4.4] exportSequence() returned: ${exportSuccess}`);
      console.log(`[步骤4.4] Result type: ${typeof exportSuccess}`);
      
      if (exportSuccess) {
        result.success = true;
        console.log('✓ 导出成功！');
      } else {
        result.error = "导出失败（encoder.exportSequence 返回 false）";
        console.log(`✗ ${result.error}`);
      }
    } catch (exportError) {
      console.error('[步骤4.3] exportSequence 抛出异常:');
      console.error('  错误消息:', exportError.message);
      console.error('  错误堆栈:', exportError.stack);
      console.error('  错误对象:', exportError);
      throw exportError; // 重新抛出以便外层 catch 捕获
    }
    
    console.log('=== 导出序列完成 ===');
    
  } catch (error) {
    console.error('=== 导出过程发生错误 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('错误对象完整信息:', JSON.stringify(error, null, 2));
    console.error('=== 错误信息结束 ===');
    
    result.error = error.message || '导出时发生错误';
  }
  
  return result;
}

/**
 * 格式化导出信息用于显示
 * @param {Object} exportResult - 导出结果对象
 * @returns {String} 格式化的 HTML 字符串
 */
function formatExportInfoForDisplay(exportResult) {
  if (!exportResult.success) {
    return `<span style="color:red">导出失败: ${exportResult.error}</span>`;
  }
  
  let html = `<strong style="color:green">导出成功！</strong><br />`;
  html += `导出路径: <span style="color:#0066cc;">${exportResult.exportPath}</span><br />`;
  html += `使用预设: <span style="color:#888;">${exportResult.presetUsed}</span><br />`;
  
  return html;
}

// 导出模块函数
module.exports = {
  exportCurrentSequence,
  formatExportInfoForDisplay
};
