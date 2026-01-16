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
 * ScriptRunner - 打开文件/文件夹位置工具
 * 使用 UXP shell.openPath API 在系统文件管理器中打开文件位置
 * 支持 Mac（访达）和 Windows（资源管理器）
 */
const fileSystemHelper = require("./FileSystemHelper");

class ScriptRunner {
  constructor() {
    this.shell = null;
    this.fs = null;
    this.isInitialized = false;
  }

  /**
   * 初始化
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('ScriptRunner: 正在初始化...');
    
    try {
      const uxp = require('uxp');
      this.shell = uxp.shell;
      this.fs = uxp.storage.localFileSystem;
      this.isInitialized = true;
      console.log('ScriptRunner: 初始化成功');
    } catch (error) {
      console.error('ScriptRunner: 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 检测操作系统类型
   * @returns {string} 'mac' 或 'windows'
   */
  detectOS() {
    // 通过路径分隔符判断操作系统
    // Windows 路径包含反斜杠和盘符，如 C:\
    // Mac 路径使用正斜杠，如 /Users/
    const testPath = __dirname || '';
    
    if (testPath.includes('\\') || /^[A-Z]:/i.test(testPath)) {
      return 'windows';
    }
    return 'mac';
  }

  /**
   * 在文件管理器中打开文件位置（核心方法）
   * Mac: 在访达中显示文件
   * Windows: 在资源管理器中选中文件
   * 
   * @param {string} filePath - 文件完整路径
   * @returns {Promise<Object>} 结果对象
   */
  async openFileLocation(filePath) {
    const result = {
      success: false,
      error: null
    };
    
    try {
      // 确保已初始化
      await this.initialize();
      
      console.log('ScriptRunner: === 开始打开文件位置 ===');
      console.log('ScriptRunner: 目标文件:', filePath);
      
      const os = this.detectOS();
      console.log('ScriptRunner: 检测到操作系统:', os);
      
      if (os === 'mac') {
        // Mac: 直接使用 shell.openPath 打开文件路径
        // 访达会自动选中文件并打开所在文件夹
        console.log('ScriptRunner: 使用 Mac 访达打开文件位置');
        
        const openResult = await this.shell.openPath(
          filePath,
          '在访达中显示文件'
        );
        
        console.log('ScriptRunner: shell.openPath 返回:', openResult);
        
        if (openResult === '') {
          result.success = true;
          console.log('ScriptRunner: ✅ 文件位置已在访达中打开');
        } else {
          result.error = `打开失败: ${openResult}`;
          console.error('ScriptRunner: ❌', result.error);
        }
        
      } else {
        // Windows: 需要创建临时批处理脚本
        console.log('ScriptRunner: 使用 Windows 资源管理器打开文件位置');
        const scriptResult = await this.createWindowsScript(filePath);
        
        if (!scriptResult.success) {
          result.error = `创建脚本失败: ${scriptResult.error}`;
          return result;
        }
        
        console.log('ScriptRunner: 准备执行脚本:', scriptResult.scriptPath);
        
        const openResult = await this.shell.openPath(scriptResult.scriptPath);
        console.log('ScriptRunner: shell.openPath 返回:', openResult);
        
        if (openResult === '') {
          result.success = true;
          console.log('ScriptRunner: ✅ 文件位置已在资源管理器中打开');
        } else {
          result.error = `执行脚本失败: ${openResult}`;
          console.error('ScriptRunner: ❌', result.error);
        }
      }
      
    } catch (error) {
      console.error('ScriptRunner: 打开文件位置时发生异常:', error);
      console.error('ScriptRunner: 错误堆栈:', error.stack);
      result.error = error.message || '打开文件位置时发生未知错误';
    }
    
    console.log('ScriptRunner: === 操作完成 ===');
    return result;
  }

  /**
   * 创建 Windows 批处理脚本（仅 Windows 使用）
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 脚本信息
   */
  async createWindowsScript(filePath) {
    const result = {
      success: false,
      scriptPath: null,
      error: null
    };
    
    try {
      console.log('ScriptRunner: 创建 Windows 批处理脚本...');
      
      // 获取临时文件夹
      const tempFolder = await this.fs.getTemporaryFolder();
      console.log('ScriptRunner: 临时文件夹:', tempFolder.nativePath);
      
      // 生成唯一的脚本文件名
      const timestamp = Date.now();
      const scriptFileName = `open_location_${timestamp}.bat`;
      
      // 创建批处理脚本文件
      const scriptFile = await tempFolder.createFile(scriptFileName, { overwrite: true });
      
      // Windows 批处理脚本内容
      // explorer /select 命令会打开资源管理器并选中指定文件
      const scriptContent = `@echo off
chcp 65001 >nul
echo Opening file location in Explorer...
explorer /select,"${filePath}"
exit
`;
      
      // 写入脚本内容
      await scriptFile.write(scriptContent);
      
      result.success = true;
      result.scriptPath = scriptFile.nativePath;
      
      console.log('ScriptRunner: 脚本创建成功:', result.scriptPath);
      
    } catch (error) {
      console.error('ScriptRunner: 创建脚本失败:', error);
      result.error = error.message || '创建脚本时发生错误';
    }
    
    return result;
  }

  /**
   * 打开文件夹（不选中任何文件）
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<Object>} 结果对象
   */
  async openFolder(folderPath) {
    const result = {
      success: false,
      error: null
    };
    
    try {
      await this.initialize();
      
      console.log('ScriptRunner: === 打开文件夹（委托 FileSystemHelper） ===');
      console.log('ScriptRunner: 目标路径:', folderPath);
      console.log('ScriptRunner: 规范化路径:', folderPath ? folderPath.replace(/\\/g, '/') : 'undefined');
      
      // 优先尝试通过 UXP FS 生成 Entry，提高权限兼容性
      await fileSystemHelper.initialize();
      let targetPath = folderPath;
      try {
        const normalized = folderPath.replace(/\\/g, '/');
        const folderUrl = normalized.startsWith('file://') ? normalized : `file:///${normalized}`;
        console.log('ScriptRunner: folderUrl:', folderUrl);
        const entry = await this.fs.getEntryWithUrl(folderUrl);
        if (entry && entry.isFolder) {
          targetPath = entry.nativePath;
          console.log('ScriptRunner: 使用 Entry.nativePath:', targetPath);
        } else {
          console.log('ScriptRunner: getEntryWithUrl 未返回文件夹，继续使用原始路径');
        }
      } catch (urlErr) {
        console.log('ScriptRunner: getEntryWithUrl 失败，继续使用原始路径:', urlErr.message);
      }
      
      // 委托给 FileSystemHelper，直接复用已验证可行的实现
      const helperResult = await fileSystemHelper.openFolderInFinder(targetPath);
      
      if (helperResult === true) {
        result.success = true;
      } else {
        result.error = 'openFolderInFinder 返回失败';
      }
      
    } catch (error) {
      console.error('ScriptRunner: ❌ 打开文件夹时发生异常:', error);
      console.error('ScriptRunner: 错误类型:', error && error.constructor ? error.constructor.name : 'unknown');
      console.error('ScriptRunner: 错误消息:', error && error.message ? error.message : 'undefined');
      console.error('ScriptRunner: 错误堆栈:', error && error.stack ? error.stack : 'undefined');
      result.error = error.message || '打开文件夹时发生错误';
    }
    
    console.log('ScriptRunner: === 操作完成 ===');
    return result;
  }

  /**
   * 销毁
   */
  async destroy() {
    this.isInitialized = false;
    console.log('ScriptRunner: 已销毁');
  }
}

// 导出单例
const scriptRunner = new ScriptRunner();
module.exports = scriptRunner;
