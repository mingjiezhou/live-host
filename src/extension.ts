import * as vscode from 'vscode';
import { CatCodingPanel } from './webview';
import { HostTreeDataProvider, HostConfig } from './treeDataProvider';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "host" is now active!');

	const hostTreeDataProvider = new HostTreeDataProvider(context);

	context.subscriptions.push(vscode.window.registerTreeDataProvider("liveHost", hostTreeDataProvider));

	context.subscriptions.push(vscode.commands.registerCommand('liveHost.add', (item: HostConfig) => {
		hostTreeDataProvider.add(item);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.delete', (item: HostConfig) => {
		hostTreeDataProvider.del(item);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.rename', (item: HostConfig) => {
		hostTreeDataProvider.rename(item);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.choose', (item: HostConfig) => {
		hostTreeDataProvider.choose(item);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.unchoose', (item: HostConfig) => {
		hostTreeDataProvider.unchoose(item);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.edit', (params) => {
		hostTreeDataProvider.edit(params);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('liveHost.start', () => {
		CatCodingPanel.createOrShow(context.extensionUri);
	}));

	vscode.workspace.onDidSaveTextDocument((e:vscode.TextDocument) => {
		if(e.fileName && e.fileName.indexOf('.host') > -1){
			hostTreeDataProvider.syncChooseHost();
		}
	});
}


// this method is called when your extension is deactivated
export function deactivate() {}




