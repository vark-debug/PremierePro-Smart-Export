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
 * FileSystemHelper - 文件系统操作辅助工具
 * 提供打开文件夹、选择文件等功能
 */
class FileSystemHelper {
  constructor() {
    this.shell = null;
    this.fs = null;
  }

  /**
   * 初始化
   */
  async initialize() {
    console.log('FileSystemHelper: Initializing...');
    
    try {
      const uxp = require('uxp');
      this.shell = uxp.shell;
      this.fs = uxp.storage.localFileSystem;
      console.log('FileSystemHelper: Initialized successfully');
    } catch (error) {
      console.error('FileSystemHelper: Initialization failed:', error);
    }
  }

  /**
   * 在访达/资源管理器中打开文件夹
   * @param {string} folderPath - 文件夹路径，如果为空则打开插件根目录
   */
  async openFolderInFinder(folderPath) {
    try {
      let targetPath = folderPath;
      
      // 如果没有指定路径，使用插件根目录
      if (!targetPath) {
        const pluginFolder = await this.fs.getPluginFolder();
        targetPath = pluginFolder.nativePath;
      }
      
      console.log('FileSystemHelper: Opening folder:', targetPath);
      
      const result = await this.shell.openPath(
        targetPath,
        '在访达中打开文件夹以查看项目文件'
      );
      
      if (result === '') {
        console.log('FileSystemHelper: ✅ 文件夹已在访达中打开');
        this.showMessage('成功', `已在访达中打开文件夹`, 'success');
        return true;
      } else {
        console.error('FileSystemHelper: ❌ 打开文件夹失败:', result);
        this.showMessage('失败', `无法打开文件夹: ${result}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('FileSystemHelper: 打开文件夹时出错:', error);
      this.showMessage('错误', `打开文件夹失败: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * 打开插件根目录
   */
  async openPluginFolder() {
    return await this.openFolderInFinder();
  }

  /**
   * 打开服务器目录
   */
  async openServerFolder() {
    try {
      const pluginFolder = await this.fs.getPluginFolder();
      const serverFolder = await pluginFolder.getEntry('server');
      return await this.openFolderInFinder(serverFolder.nativePath);
    } catch (error) {
      console.error('FileSystemHelper: 服务器文件夹不存在:', error);
      this.showMessage('错误', '找不到服务器文件夹', 'error');
      return false;
    }
  }

  /**
   * 获取插件根目录路径
   */
  async getPluginFolderPath() {
    try {
      const pluginFolder = await this.fs.getPluginFolder();
      return pluginFolder.nativePath;
    } catch (error) {
      console.error('FileSystemHelper: 获取插件目录路径失败:', error);
      return null;
    }
  }

  /**
   * 显示消息到UI
   */
  showMessage(title, message, type = 'info') {
    const pluginBody = document.getElementById('plugin-body');
    if (!pluginBody) return;

    const colors = {
      success: { border: '#4caf50', text: '#4caf50', bg: 'rgba(76, 175, 80, 0.1)' },
      error: { border: '#f44336', text: '#f44336', bg: 'rgba(244, 67, 54, 0.1)' },
      info: { border: '#2196f3', text: '#2196f3', bg: 'rgba(33, 150, 243, 0.1)' },
      warning: { border: '#ff9800', text: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' }
    };

    const color = colors[type] || colors.info;

    const messageDiv = `
      <div style="
        color: ${color.text}; 
        background: ${color.bg};
        padding: 10px; 
        border: 1px solid ${color.border}; 
        border-radius: 4px; 
        margin: 10px 0;
      ">
        <strong>${title}</strong><br/>
        <span style="color: #ccc;">${message}</span>
      </div>
    `;
    
    pluginBody.innerHTML += messageDiv;
  }

  /**
   * 销毁
   */
  async destroy() {
    console.log('FileSystemHelper: Destroyed');
  }
}

// 导出单例
const fileSystemHelper = new FileSystemHelper();
module.exports = fileSystemHelper;
