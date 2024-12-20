/**
 * 이 파일은 아이모듈 이메일모듈 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/email/admin/scripts/Email.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 11. 1.
 */
namespace modules {
    export namespace email {
        export namespace admin {
            export class Email extends modules.admin.admin.Component {
                /**
                 * 모듈 환경설정 폼을 가져온다.
                 *
                 * @return {Promise<Aui.Form.Panel>} configs
                 */
                async getConfigsForm(): Promise<Aui.Form.Panel> {
                    return new Aui.Form.Panel({
                        scrollable: true,
                        items: [
                            new Aui.Form.FieldSet({
                                title: await this.getText('admin.configs.default'),
                                items: [
                                    new AdminUi.Form.Field.Template({
                                        label: await this.getText('admin.configs.template'),
                                        name: 'template',
                                        allowBlank: false,
                                        componentType: this.getType(),
                                        componentName: this.getName(),
                                    }),
                                    new Aui.Form.Field.Container({
                                        items: [
                                            new Aui.Form.Field.Text({
                                                label: (await this.getText(
                                                    'admin.configs.default_from_address'
                                                )) as string,
                                                name: 'default_from_address',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                            new Aui.Form.Field.Text({
                                                label: (await this.getText(
                                                    'admin.configs.default_from_name'
                                                )) as string,
                                                name: 'default_from_name',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Aui.Form.FieldSet({
                                title: await this.getText('admin.configs.smtp'),
                                items: [
                                    new Aui.Form.Field.Text({
                                        label: await this.getText('admin.configs.smtp_host'),
                                        name: 'smtp_host',
                                        allowBlank: false,
                                        flex: 1,
                                    }),
                                    new Aui.Form.Field.Container({
                                        items: [
                                            new Aui.Form.Field.Text({
                                                label: await this.getText('admin.configs.smtp_port'),
                                                name: 'smtp_port',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                            new Aui.Form.Field.Select({
                                                label: await this.getText('admin.configs.smtp_secure'),
                                                name: 'smtp_secure',
                                                store: new Aui.Store.Local({
                                                    fields: ['value'],
                                                    records: [['NONE'], ['TLS'], ['SSL']],
                                                }),
                                                displayField: 'value',
                                                valueField: 'value',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                        ],
                                    }),
                                    new Aui.Form.Field.Container({
                                        label: await this.getText('admin.configs.smtp_auth'),
                                        direction: 'column',
                                        items: [
                                            new Aui.Form.Field.Check({
                                                name: 'smtp_auth',
                                                boxLabel: (await this.getText(
                                                    'admin.configs.smtp_auth_help'
                                                )) as string,
                                                listeners: {
                                                    change: (field, value) => {
                                                        const form = field.getForm();
                                                        form.getField('smtp_id').setDisabled(!value);
                                                        form.getField('smtp_password').setDisabled(!value);
                                                    },
                                                },
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: await this.getText('admin.configs.smtp_auth_info'),
                                                items: [
                                                    new Aui.Form.Field.Text({
                                                        label: await this.getText('admin.configs.smtp_id'),
                                                        name: 'smtp_id',
                                                        allowBlank: false,
                                                        flex: 1,
                                                        disabled: true,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: (await this.getText(
                                                            'admin.configs.smtp_password'
                                                        )) as string,
                                                        name: 'smtp_password',
                                                        allowBlank: false,
                                                        flex: 1,
                                                        disabled: true,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                        listeners: {
                            load: (form, response) => {
                                if (
                                    (response?.data?.smtp_id ?? null) !== null &&
                                    (response?.data?.smtp_password ?? null) !== null
                                ) {
                                    form.getField('smtp_auth').setValue(true);
                                }
                            },
                        },
                    });
                }

                /**
                 * 수신자 정보를 가져온다.
                 *
                 * @param {object} address
                 */
                getAddress(address: { [key: string]: any }): string {
                    if (member === null) {
                        return '';
                    }

                    return (
                        '<i class="photo" style="background-image:url(' +
                        address.member.photo +
                        ')"></i>' +
                        address.name +
                        ' &lt;' +
                        address.address +
                        '&gt;'
                    );
                }

                /**
                 * 메세지관리
                 */
                messages = {
                    /**
                     * 메세지 상세내용을 확인한다.
                     *
                     * @param {string} message_id - 메시지고유값
                     * @param {string} title - 제목
                     * @param {object} to - 수신자
                     */
                    show: async (message_id: string, title: string, to: { [key: string]: any }) => {
                        new Aui.Window({
                            title: title,
                            width: 600,
                            height: 500,
                            modal: true,
                            resizable: true,
                            items: [
                                new Aui.Panel({
                                    border: false,
                                    layout: 'fit',
                                    readonly: true,
                                    padding: 0,
                                    topbar: [
                                        new Aui.Form.Field.Display({
                                            value: to,
                                            renderer: (value) => {
                                                return this.getAddress(value);
                                            },
                                        }),
                                    ],
                                    items: [
                                        new Aui.Text({
                                            padding: 0,
                                            layout: 'content',
                                        }),
                                    ],
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    if (message_id !== null) {
                                        const results = await Ajax.get(this.getProcessUrl('message'), {
                                            message_id: message_id,
                                        });

                                        if (results.success == true) {
                                            const $content = window.getItemAt(0).getItemAt(0).$getContent();
                                            $content.html(results.data.content);
                                        } else {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                };
            }
        }
    }
}
