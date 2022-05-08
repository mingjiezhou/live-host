// @ts-nocheck
import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'
import { FileUtil } from './utils/fileUtil'
export class HostTreeDataProvider implements vscode.TreeDataProvider<HostConfig> {
  private _onDidChangeTreeData: vscode.EventEmitter<HostConfig | undefined> =
    new vscode.EventEmitter<HostConfig | undefined>()
  readonly onDidChangeTreeData: vscode.Event<HostConfig | undefined> =
    this._onDidChangeTreeData.event
  // readonly appRoot:string = vscode.env.appRoot;
  private userRoot: string
  constructor(private context: vscode.ExtensionContext) {
    // check host config floder if exists
    this.userRoot = os.homedir()
    vscode.window.showInformationMessage(this.userRoot)

    if (!FileUtil.pathExists(path.join(this.userRoot, '.host'))) {
      //if not exists create default host floder
      try {
        FileUtil.createDefaultHostFloder(this.userRoot)
      } catch (e) {
        vscode.window.showInformationMessage('host need Administrator permission!')
      }
    }
  }

  getTreeItem(element: HostConfig): vscode.TreeItem {
    return element
  }

  getChildren(element?: HostConfig): Thenable<HostConfig[]> {
    let files: string[] = FileUtil.gethostConfigFileList(this.userRoot)
    let metaInfo = FileUtil.getMetaInfo(this.userRoot)
    if (files && files.length > 0) {
      let hostConfigs = new Array<HostConfig>()
      files.forEach(file => {
        let filePath = path.join(this.userRoot, '.host', file)
        let uri = vscode.Uri.file(filePath)
        let label = path.basename(file, '.host')
        hostConfigs.push(
          new HostConfig(
            label,
            vscode.TreeItemCollapsibleState.None,
            { command: 'liveHost.edit', title: '', arguments: [uri] },
            `hostItem${metaInfo.cur.indexOf(label) > -1 ? 1 : 0}`,
            filePath,
            metaInfo.cur.indexOf(label) > -1
          )
        )
      })

      return Promise.resolve(hostConfigs)
    } else {
      return Promise.resolve([])
    }
  }

  choose(item: HostConfig): void {
    if (item.filePath) {
      let metaInfo = FileUtil.getMetaInfo(this.userRoot)
      if (metaInfo.cur.indexOf(item.label) > -1) {
        vscode.window.showInformationMessage('This host is choosed areadly!')
      } else {
        metaInfo.cur.push(item.label)
        FileUtil.setMetaInfo(this.userRoot, metaInfo)
        FileUtil.syncChooseHost(this.userRoot)
        this._onDidChangeTreeData.fire(null)
        vscode.window.showInformationMessage('This host is choosed areadly!')
      }
    }
  }
  syncChooseHost(): void {
    FileUtil.syncChooseHost(this.userRoot)
  }
  unchoose(item: HostConfig): void {
    if (item.filePath) {
      let metaInfo = FileUtil.getMetaInfo(this.userRoot)
      let labelIndex = metaInfo.cur.indexOf(item.label)
      if (labelIndex > -1) {
        metaInfo.cur.splice(labelIndex, 1)
        FileUtil.setMetaInfo(this.userRoot, metaInfo)
        FileUtil.syncChooseHost(this.userRoot)
        this._onDidChangeTreeData.fire(undefined)
        vscode.window.showInformationMessage('UnChoose Host Success!')
      }
    }
  }
  edit(params: any): void {
    vscode.workspace
      .openTextDocument(params)
      .then(document => vscode.window.showTextDocument(document))
  }

  rename(item: HostConfig): void {
    vscode.window
      .showInputBox({ placeHolder: 'Enter the new host name', value: item.label })
      .then(value => {
        if (value) {
          let files: string[] = FileUtil.gethostConfigFileList(this.userRoot)
          if (files && files.indexOf(`${value}.host`) > -1) {
            vscode.window.showInformationMessage('This name is aready exist!')
          } else {
            FileUtil.renameHostFile(this.userRoot, item.label, value)
            let metaInfo = FileUtil.getMetaInfo(this.userRoot)
            let labelIndex = metaInfo.cur.indexOf(item.label)
            if (labelIndex > -1) {
              metaInfo.cur[labelIndex] = value
              FileUtil.setMetaInfo(this.userRoot, metaInfo)
            }
            this._onDidChangeTreeData.fire(undefined)
          }
        } else {
          vscode.window.showInformationMessage('Please enter your host name!')
        }
      })
  }

  add(item: HostConfig): void {
    vscode.window.showInputBox({ placeHolder: 'Enter the new host name' }).then(value => {
      if (!value) {
        return
      }
      let files: string[] = FileUtil.gethostConfigFileList(this.userRoot)
      let a = files.filter(file => {
        let basename = path.basename(file, '.host')
        return basename === value
      })
      if (!a || a.length === 0) {
        FileUtil.createHostFile(this.userRoot, value)
        this._onDidChangeTreeData.fire(undefined)
      }
    })
  }
  del(item: HostConfig): void {
    FileUtil.delHostFile(this.userRoot, item)
    this._onDidChangeTreeData.fire(undefined)
  }
}

export class HostConfig extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public contextValue?: string,
    public filePath?: string,
    public chooseStatus?: boolean
  ) {
    super(label, collapsibleState)
  }
  get tooltip(): string {
    return `${this.label}`
  }
  get description(): string | boolean {
    return false
  }
  get iconPath(): string {
    return path.join(
      __filename,
      '..',
      '..',
      'resources',
      'light',
      this.chooseStatus ? 'checked.svg' : 'unchecked.svg'
    )
  }
}
