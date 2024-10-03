import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface WikilinkToMarkdownSettings {
    language: string;
}

const DEFAULT_SETTINGS: WikilinkToMarkdownSettings = {
    language: 'en'
}

interface LanguageStrings {
    convertButtonText: string;
    openFileNotice: string;
    confirmConversionTitle: string;
    confirmConversionMessage: string;
    confirmButton: string;
    cancelButton: string;
    conversionCompleteNotice: string;
    confirmChangeTitle: string;
    confirmChangeMessage: string;
}

const zhStrings: LanguageStrings = {
    convertButtonText: '转换WikiLink为Markdown',
    openFileNotice: '请打开一篇文章以进行转换',
    confirmConversionTitle: '确认转换',
    confirmConversionMessage: '是否要转换当前文档中的WikiLinks为Markdown格式？',
    confirmButton: '确认',
    cancelButton: '取消',
    conversionCompleteNotice: '转换完成',
    confirmChangeTitle: '确认更改',
    confirmChangeMessage: '转换完成,是否确认更改？'
};

const enStrings: LanguageStrings = {
    convertButtonText: 'Convert WikiLinks to Markdown',
    openFileNotice: 'Please open a file to convert',
    confirmConversionTitle: 'Confirm Conversion',
    confirmConversionMessage: 'Do you want to convert WikiLinks to Markdown format in the current document?',
    confirmButton: 'Confirm',
    cancelButton: 'Cancel',
    conversionCompleteNotice: 'Conversion complete',
    confirmChangeTitle: 'Confirm Changes',
    confirmChangeMessage: 'Conversion complete. Do you want to confirm the changes?'
};

export default class WikilinkToMarkdownPlugin extends Plugin {
    settings: WikilinkToMarkdownSettings;
    strings: LanguageStrings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new WikilinkToMarkdownSettingTab(this.app, this));

        this.updateStrings();

        this.addRibbonIcon('link', this.strings.convertButtonText, (evt: MouseEvent) => {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                new ConfirmModal(this.app, this.strings, async () => {
                    await this.convertWikilinksToMarkdown(activeView.editor);
                }).open();
            } else {
                new Notice(this.strings.openFileNotice);
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateStrings();
    }

    updateStrings() {
        this.strings = this.settings.language === 'zh' ? zhStrings : enStrings;
    }

    async convertWikilinksToMarkdown(editor: Editor) {
        const content = editor.getValue();
        const convertedContent = this.convertContent(content);
        
        new ConfirmChangeModal(this.app, this.strings, async () => {
            editor.setValue(convertedContent);
            new Notice(this.strings.conversionCompleteNotice);
        }).open();
    }

    convertContent(content: string): string {
        // Convert wikilinks to Markdown links
        content = content.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (match, link, alias) => {
            if (this.isExternalLink(link)) {
                // For external links, always use Markdown format
                return `[${alias || link}](${link})`;
            } else {
                const processedLink = this.processLink(link);
                const displayName = alias || this.getDisplayName(link);
                return `[${displayName}](${processedLink})`;
            }
        });

        // Convert wikilink images to Markdown images
        content = content.replace(/!\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (match, link, alias) => {
            const processedLink = this.processLink(link);
            if (alias) {
                return `![${alias}](${processedLink})`;
            } else {
                return `![](${processedLink})`;
            }
        });

        return content;
    }

    private isExternalLink(link: string): boolean {
        return link.startsWith('http://') || link.startsWith('https://') || link.startsWith('www.');
    }

    private processLink(link: string): string {
        if (this.isExternalLink(link)) {
            return link;
        }

        // If it's a local link without a file extension, add .md extension
        if (!link.match(/\.\w+$/)) {
            link += '.md';
        }

        // Handle spaces in file names
        return link.replace(/ /g, '%20');
    }

    private getDisplayName(link: string): string {
        // Remove path, keep only the file name
        const fileName = link.split('/').pop() || link;
        
        // Remove file extension
        return fileName.replace(/\.\w+$/, '');
    }
}

class ConfirmModal extends Modal {
    constructor(app: App, private strings: LanguageStrings, private onConfirm: () => void) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: this.strings.confirmConversionTitle});
        contentEl.createEl('p', {text: this.strings.confirmConversionMessage});
        
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText(this.strings.confirmButton)
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onConfirm();
                }))
            .addButton(btn => btn
                .setButtonText(this.strings.cancelButton)
                .onClick(() => this.close()));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class ConfirmChangeModal extends Modal {
    constructor(app: App, private strings: LanguageStrings, private onConfirm: () => void) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl('h2', {text: this.strings.confirmChangeTitle});
        contentEl.createEl('p', {text: this.strings.confirmChangeMessage});
        
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText(this.strings.confirmButton)
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onConfirm();
                }))
            .addButton(btn => btn
                .setButtonText(this.strings.cancelButton)
                .onClick(() => this.close()));
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class WikilinkToMarkdownSettingTab extends PluginSettingTab {
    plugin: WikilinkToMarkdownPlugin;

    constructor(app: App, plugin: WikilinkToMarkdownPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Language')
            .setDesc('Choose the language for the plugin interface')
            .addDropdown(dropdown => dropdown
                .addOption('en', 'English')
                .addOption('zh', '中文')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));
    }
}
