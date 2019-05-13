import { rhamtEvents } from '../events';
import { AnalysisResults, AnalysisResultsSummary } from './analysisResults';
import * as path from 'path';

export class RhamtModel {

    public configurations: RhamtConfiguration[] = [];

    public exists(name: string): boolean {
        for (const config of this.configurations) {
            if (config.name === name) {
                return true;
            }
        }
        return false;
    }
}

export namespace AnalysisState {
    export const ANALYZING = 0;
    export const STOPPED = 1;
    export const COMPLETED = 2;
}

export namespace ChangeType {
    export const MODIFIED = 0;
    export const ADDED    = 1;
    export const DELETED  = 2;
    export const PROGRESS = 3;
    export const CANCELLED = 4;
    export const ERROR = 5;
    export const COMPLETE = 6;
    export const STARTED = 7;
    export const CLONING = 8;
}

export interface CloneUpdate {
    readonly input: Clone;
    readonly value: number;
    readonly title: string;
    readonly description?: string;
}

export interface Input {
    id: string;
    path: string;
}

export interface Clone extends Input {
    repo: string;
    starting: boolean;
    cloning: boolean;
    cancelled: boolean;
    completed: boolean;
}

export class RhamtConfiguration {
    onChanged = new rhamtEvents.TypedEvent<{type: number, name: string, value: any}>();
    onResultsLoaded = new rhamtEvents.TypedEvent<void>();
    id: string;
    name: string;
    summary: AnalysisResultsSummary | undefined;
    private _results: AnalysisResults | undefined;
    rhamtExecutable: string;
    options: { [index: string]: any } = {};

    set results(results: AnalysisResults | undefined) {
        this._results = results;
        this.onResultsLoaded.emit(undefined);
    }

    get results(): AnalysisResults | undefined {
        return this._results;
    }

    getReport(): string {
        return path.resolve(this.options['output'], 'index.html');
    }

    getResultsLocation(): string {
        return path.resolve(this.options['output'], 'results.xml');
    }

    deleteIssue(issue: IIssue): void {
        this.results.deleteIssue(issue);
    }

    markIssueAsComplete(issue: IIssue): void {
        this.results.markIssueAsComplete(issue);
    }
}

export interface IUniqueElement {
    id: string;
}

export interface ILink extends IUniqueElement {
    description: string;
    url: string;
}

export interface IIssue extends IUniqueElement {
    quickfixes: IQuickFix[];
    file: string;
    severity: string;
    ruleId: string;
    effort: string;
    links: ILink[];
    report: string;
    category: string;
    getConfiguration: () => RhamtConfiguration;
    dom: any;
}

export type IQuickFixType = 'REPLACE' | 'DELETE_LINE' | 'INSERT_LINE' | 'TRANSFORMATION';

export interface IQuickFix extends IUniqueElement {
    type: IQuickFixType;
    searchString: string;
    replacementString: string;
    newLine: string;
    transformationId: string;
    name: string;
    file: string;
}

export interface ReportHolder {
    getReport: () => string;
}

export interface IssueContainer {
    getIssue: () => IIssue;
}

export interface IHint extends IIssue {
    originalLineSource: string;
    lineNumber: number;
    column: number;
    length: number;
    sourceSnippet: string;
    hint: string;
    title: string;
}

export interface IClassification extends IIssue {
    description: string;
}

export interface ReportEndpoints {
    location(): string;
    port(): string;
    resourcesRoot(): any;
    reportsRoot(): any;
}
