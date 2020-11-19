import Express from 'express';

export const handler = async (req: Express.Request) => {
  const response = [];
  response.push({
    type: 'textarea',
    description: '担当営業へのメッセージを100文字以内で入力してください。',
    name: 'from_message',
    label: '担当営業へのメッセージ',
    required: true,
  });
  response.push({
    type: 'textarea',
    description: 'お客様へのメッセージテンプレートを75文字以内入力してください。',
    name: 'to_message',
    label: 'お客様へのメッセージテンプレート',
    required: true,
  });

  return response;
};
