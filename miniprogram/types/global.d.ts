// 全局类型声明

// 列表响应类型
interface ListResponse<T = any> {
  code: number;
  message: string;
  data: {
    list: T[];
    total: number;
  };
}

// App 全局数据
interface GlobalData {
  token: string;
  userInfo: any;
  isLoggedIn: boolean;
  apiBase: string;
  statusBarHeight: number;
}

// App 实例
interface IAppOption {
  globalData: GlobalData;
  onLaunch(options?: any): void;
  onShow(options?: any): void;
  onHide(): void;
  login(token: string, user: any): void;
  logout(): void;
}

// 页面实例
interface IPageOption {
  data: any;
  onLoad(options?: any): void;
  onShow(): void;
  onReady(): void;
  onHide(): void;
  onUnload(): void;
  onPullDownRefresh(): void;
  onReachBottom(): void;
  onShareAppMessage(options?: any): void;
  setData(data: any): void;
}

// 声明全局方法
declare function getApp<T = IAppOption>(): T;
declare const wx: any;

// 模块声明
declare module 'tdesign-miniprogram' {
  export * from 'tdesign-miniprogram/esm/index';
}
declare module 'tdesign-miniprogram/toast' {
  export default any;
}
declare module 'tdesign-miniprogram/dialog' {
  export default any;
}

// 环境变量
declare namespace wx {
  const env: {
    USER_DATA_PATH: string;
  };

  function getFileSystemManager(): FileSystemManager;

  interface FileSystemManager {
    writeFile(params: {
      filePath: string;
      data: string | ArrayBuffer;
      encoding?: string;
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: () => void;
    }): void;

    readFile(params: {
      filePath: string;
      encoding?: string;
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: () => void;
    }): void;

    getFileInfo(params: {
      filePath: string;
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: () => void;
    }): void;

    removeSavedFile(params: {
      filePath: string;
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: () => void;
    }): void;
  }
}
