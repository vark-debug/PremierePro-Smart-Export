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
 * 项目位置检测模块 - 获取当前项目文件的保存位置
 * Project Location Detector Module - Get current project file location
 */

const ppro = require("premierepro");

/**
 * 获取当前项目文件的位置
 * @returns {Promise<Object>} 项目位置信息
 */
async function getProjectLocation() {
  const result = {
    success: false,
    projectPath: '',
    projectName: '',
    projectDirectory: '',
    isProjectSaved: false,
    error: null
  };
  
  try {
    console.log('=== 开始获取项目位置 ===');
    
    // 获取活动项目
    const project = await ppro.Project.getActiveProject();
    
    if (!project) {
      result.error = "没有打开的项目";
      console.log(result.error);
      return result;
    }
    
    console.log('Active project found');
    
    // 获取项目路径
    const projectPath = project.path;
    
    if (!projectPath || projectPath === '') {
      result.error = "项目尚未保存（无文件路径）";
      result.isProjectSaved = false;
      console.log(result.error);
      return result;
    }
    
    result.isProjectSaved = true;
    result.projectPath = projectPath;
    
    console.log(`Project path: ${projectPath}`);
    
    // 从路径中提取项目名称
    const lastSlash = Math.max(
      projectPath.lastIndexOf('/'),
      projectPath.lastIndexOf('\\')
    );
    
    if (lastSlash >= 0) {
      result.projectName = projectPath.substring(lastSlash + 1);
      result.projectDirectory = projectPath.substring(0, lastSlash);
    } else {
      result.projectName = projectPath;
      result.projectDirectory = '';
    }
    
    console.log(`Project name: ${result.projectName}`);
    console.log(`Project directory: ${result.projectDirectory}`);
    
    result.success = true;
    
    console.log('=== 获取项目位置完成 ===');
    
  } catch (error) {
    console.error('Error getting project location:', error);
    console.error('Error stack:', error.stack);
    result.error = error.message || '获取项目位置时发生错误';
  }
  
  return result;
}

/**
 * 格式化项目位置信息用于显示
 * @param {Object} locationResult - 项目位置结果对象
 * @returns {String} 格式化的 HTML 字符串
 */
function formatProjectLocationForDisplay(locationResult) {
  if (!locationResult.success) {
    return `<span style="color:red">获取失败: ${locationResult.error}</span>`;
  }
  
  let html = `<strong>当前项目位置</strong><br />`;
  html += `项目名称: <strong>${locationResult.projectName}</strong><br />`;
  html += `项目目录: <span style="color:#888;">${locationResult.projectDirectory}</span><br />`;
  html += `完整路径: <span style="color:#0066cc;">${locationResult.projectPath}</span><br />`;
  
  return html;
}

// 导出模块函数
module.exports = {
  getProjectLocation,
  formatProjectLocationForDisplay
};
