import Express from 'express';

export const handler = async (req: Express.Request) => {
  const response = [];
  response.push({
    type: 'textarea',
    description: '送信元の方へのメッセージを100文字以内で入力してください。',
    name: 'from_message',
    label: '送信元の方へのメッセージ',
    required: true,
  });
  response.push({
    type: 'textarea',
    description: '送信先の方へのメッセージテンプレートを75文字以内入力してください。',
    name: 'to_message',
    label: '送信先の方へのメッセージテンプレート',
    required: true,
  });

  return response;
};
