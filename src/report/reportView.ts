/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { WebviewPanel, window, ViewColumn, ExtensionContext, commands, env, Uri } from 'vscode';
import { Endpoints } from '../model/model';
import { ModelService } from '../model/modelService';

export class ReportView {

    private view: WebviewPanel | undefined = undefined;
    private endpoints: Endpoints;
    private context: ExtensionContext;
    private modelService: ModelService;

    constructor(context: ExtensionContext, endpoints: Endpoints, modelService: ModelService) {
        this.context = context;
        this.endpoints = endpoints;
        this.modelService = modelService;
        this.context.subscriptions.push(commands.registerCommand('rhamt.openReportExternal', async item => {
            this.openReport(item, true);
        }));
    }

    private async openReport(item: any, external?: boolean): Promise<any> {
        const location = item.getReport() as string;
        if (!location) {
            return window.showErrorMessage(`Unable to find report on filesystem`);
        }
        console.log(`report: ${location}`);
        console.log(`this.endpoints.reportsRoot() - ${this.endpoints.reportsRoot()}`);
        
        
        // const relative = location.replace(`${this.endpoints.reportsRoot()}/`, '');
        // const relative = location.replace(`${item.config.options['output']}/`, '');
        const relative = location.replace(`${this.modelService.outDir}/`, '');
        console.log(`relative: ` + relative);
        
        const url = await this.endpoints.reportLocation();
        const report = `${url}${relative}`;

        console.log(`url: ${report}`);
        
        this.open(report, external);
    }

    open(location: string, external?: boolean): void {
        if (external) { 
            env.openExternal(Uri.parse(location));
            return;
        }
        if (!this.view) {
            this.view = window.createWebviewPanel('rhamtReportView', 'MTA Report', ViewColumn.One, {
                enableScripts: true,
                enableCommandUris: true,
                retainContextWhenHidden: true
            });
            this.view.onDidDispose(() => {
                this.view = undefined;
            });
        }
        this.view.webview.html = this.render(location);
        this.view.reveal(ViewColumn.One);
    }

    private render(location: string): string {
        return `
            <!DOCTYPE html>
            <html>
                <body style="margin:0px;padding:0px;overflow:hidden">
                    <iframe src="${location}"
                        frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
                </body>
            </html>
        `;
    }
}