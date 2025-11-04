// // amplify/data/resource.ts
// import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// const schema = a.schema({
//   Todo: a.model({
//     content: a.string(),
//     isDone: a.boolean(),
//   }).authorization(allow => [ allow.publicApiKey() ]),
// });

// export type Schema = ClientSchema<typeof schema>;

// export const data = defineData({
//   schema,
//   authorizationModes: {
//     defaultAuthorizationMode: 'apiKey',
//     apiKeyAuthorizationMode: { expiresInDays: 30 },
//   },
// });

// // amplify/data/resource.ts
// import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// const schema = a.schema({
//   Todo: a.model({
//     content: a.string(),
//     isDone: a.boolean(),
//   }).authorization(allow => [ allow.owner() ]),  // ← ここをownerに
// });

// export type Schema = ClientSchema<typeof schema>;

// export const data = defineData({
//   schema,
//   authorizationModes: {
//     defaultAuthorizationMode: 'userPool',   // ← ここも userPool に
//   },
// });

// amplify/data/resource.ts
import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a.model({
    owner: a.string(),
    content: a.string(),
    isDone: a.boolean(),
  }).authorization(allow => [ allow.owner() ]),

  PublicPost: a.model({
    owner: a.string(),
    title: a.string(),
    body: a.string(),
    category: a.string(),
  }).authorization(allow => [
    // allow.authenticated().to(['read','create','update','delete']), // 認証済みは全ての操作可能
    allow.publicApiKey().to(['read']),
    allow.owner().to(['read','create','update','delete']), // 作成/更新/削除はログイン者
  ]),

  Hello: a.model({
    owner: a.string(),
    message: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.owner().to(['read','create','update','delete']), // 作成/更新/削除はログイン者
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // デフォルト: ログインユーザー、ログイン済みはJWTで認証
    apiKeyAuthorizationMode: { expiresInDays: 30 }, // 公開用も追加、匿名でもOK
  },
});
