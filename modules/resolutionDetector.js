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
 * 分辨率检测模块 - 检测当前时间线分辨率并选择预设
 * Resolution Detector Module - Detect timeline resolution and select preset
 */

const ppro = require("premierepro");

/**
 * 检测当前时间线分辨率
 * @returns {Promise<Object>} 分辨率信息和推荐预设
 */
async function detectResolution() {
  const result = {
    success: false,
    width: 0,
    height: 0,
    longEdge: 0,
    shortEdge: 0,
    recommendedPreset: '',
    presetFile: '',
    bitrate: '',
    error: null
  };
  
  try {
    console.log('=== 开始检测分辨率 ===');
    
    // 获取活动项目
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      result.error = "没有打开的项目";
      console.log(result.error);
      return result;
    }
    
    // 获取活动序列
    const sequence = await project.getActiveSequence();
    if (!sequence) {
      result.error = "没有活动的序列";
      console.log(result.error);
      return result;
    }
    
    console.log(`活动序列: ${sequence.name}`);
    
    // 获取序列设置（分辨率信息）
    // 根据官方API文档：sequence.getSettings() -> settings.getVideoFrameRect() -> RectF{width, height}
    const settings = await sequence.getSettings();
    if (!settings) {
      result.error = "无法获取序列设置";
      console.log(result.error);
      return result;
    }
    
    console.log('成功获取序列设置');
    
    // 获取视频帧矩形（包含宽度和高度）
    const frameRect = await settings.getVideoFrameRect();
    if (!frameRect) {
      result.error = "无法获取视频帧尺寸";
      console.log(result.error);
      return result;
    }
    
    console.log('帧矩形对象:', frameRect);
    
    const width = frameRect.width;
    const height = frameRect.height;
    
    if (!width || !height || width === 0 || height === 0) {
      result.error = `无法获取有效的分辨率信息 (width: ${width}, height: ${height})`;
      console.log(result.error);
      return result;
    }
    
    result.width = width;
    result.height = height;
    result.longEdge = Math.max(width, height);
    result.shortEdge = Math.min(width, height);
    
    console.log(`分辨率: ${width} x ${height}`);
    console.log(`长边: ${result.longEdge}`);
    
    // 根据长边选择预设（使用 H.264 替代 HEVC）
    if (result.longEdge >= 3840) {
      // 4K 或更高分辨率
      result.recommendedPreset = "H.264 匹配帧 48Mbps (4K+)";
      result.presetFile = "h264匹配帧48mbps.epr";
      result.bitrate = "48mbps";
      console.log(`检测到 4K+ 分辨率，使用 48Mbps 预设`);
    } else {
      // 1080p 或更低分辨率
      result.recommendedPreset = "H.264 匹配帧 10Mbps (1080p)";
      result.presetFile = "h264匹配帧10mbps.epr";
      result.bitrate = "10mbps";
      console.log(`检测到 1080p 分辨率，使用 10Mbps 预设`);
    }
    
    console.log(`推荐预设: ${result.recommendedPreset}`);
    
    result.success = true;
    console.log('=== 分辨率检测完成 ===');
    
  } catch (error) {
    console.error('Error detecting resolution:', error);
    console.error('Error stack:', error.stack);
    result.error = error.message || '检测分辨率时发生错误';
  }
  
  return result;
}

/**
 * 格式化分辨率信息用于显示
 * @param {Object} resolutionResult - 分辨率结果对象
 * @returns {String} 格式化的 HTML 字符串
 */
function formatResolutionForDisplay(resolutionResult) {
  if (!resolutionResult.success) {
    return `<span style="color:red">检测失败: ${resolutionResult.error}</span>`;
  }
  
  let html = `<strong>分辨率检测</strong><br />`;
  html += `分辨率: <strong>${resolutionResult.width} x ${resolutionResult.height}</strong><br />`;
  html += `长边: <span style="color:#888;">${resolutionResult.longEdge}px</span><br />`;
  html += `推荐预设: <span style="color:#00aa00;">${resolutionResult.recommendedPreset}</span><br />`;
  html += `码率: <span style="color:#0066cc;">${resolutionResult.bitrate}</span><br />`;
  
  return html;
}

// 导出模块函数
module.exports = {
  detectResolution,
  formatResolutionForDisplay
};
