import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPreMessageSentModify } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

export class WordReplaceApp extends App implements IPreMessageSentModify {
    private replaceList;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.replaceList = [];
    }

    public async onEnable(
        environment: IEnvironmentRead,
        configurationModify: IConfigurationModify,
    ): Promise<boolean> {
        const metaFilterList = await environment.getSettings().getValueById('replaceList') as string;

        return this.parseConfig(metaFilterList);
    }

    public async onSettingUpdated(
        setting: ISetting,
        configurationModify: IConfigurationModify,
        read: IRead,
        http: IHttp,
    ): Promise<void> {
        if (setting.id !== 'replaceList') {
            return;
        }

        this.parseConfig(setting.value);
    }

    public async checkPreMessageSentModify(message: IMessage): Promise<boolean> {
        return typeof message.text === 'string';
    }

    public async executePreMessageSentModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
    ): Promise<IMessage> {
        let text = message.text || '';

        Object.keys(this.replaceList).forEach((key) => {
            const filter = this.replaceList[key] || {};

            // const source = filter.source.replace(/([^\w])/g, '\\$1');

            // text = text.replace(new RegExp(source || '', 'gi'), filter.replacement || '');

            const source = filter.source.replace(/([^\w])/g, '\\\$1'); // double parse to keep a slash in pattern

            // Only select the source between spaces OR at beginning/end of line but without slash character (`)
            const pattern = `(?<!\\w|\\\`\\\`\\\`|\\\`.*)(?:\\s)*(${source})(?:\\s)*(?![\\w!@#$%^&*()-+<>?;'{}\\[\\]\\/\\:])`;
            text = text.replace(new RegExp(pattern || '', 'gi'), ` ${filter.replacement} ` || '');
        });

        return builder.setText(text).getMessage();
    }


    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await configuration.settings.provideSetting({
            id: 'replaceList',
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            multiline: true,
            i18nLabel: 'app_label',
            i18nDescription: 'app_description',
        });
    }

    private parseConfig(text) {
        let newFilterList = [];

        try {
            newFilterList = JSON.parse(text);
            this.replaceList  = newFilterList;

            return true;
        } catch (e) {
            return false;
        }
    }
}
