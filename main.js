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
 * 主入口文件 - 插件初始化和主题管理
 * Main Entry Point - Plugin initialization and theme management
 */

const eventHandler = require("./eventHandler");

/**
 * 更新主题
 * @param {string} theme - 主题名称
 */
function updateTheme(theme) {
  const panelBody = document.getElementById("plugin-body");
  
  if (panelBody) {
    // Spectrum 组件会自动适配主题，不需要手动设置颜色
    console.log(`主题已更新: ${theme}`);
  }
}

/**
 * 初始化插件
 */
function initializePlugin() {
  console.log("快速导出插件初始化...");
  
  // 初始化事件处理器
  eventHandler.initializeEventHandlers();
  
  // 初始化主题
  const currentTheme = document.theme.getCurrent();
  updateTheme(currentTheme);
  
  // 监听主题变化
  document.theme.onUpdated.addListener((theme) => {
    updateTheme(theme);
  });
  
  console.log("快速导出插件初始化完成");
}

// 当 DOM 加载完成后初始化插件
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePlugin);
} else {
  initializePlugin();
}
