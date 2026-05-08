| Event                    | Params                                                                 | Comments                                               |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| App Page View            |                                                                        | use "screen" method instead of event                   |
| claim_initiate           | wallet_address                                                         | (click "Claim ") - ?                                   |
| claim_reward_click       | type (big, regular, epoch), amount_sol, count, wallet_address - ?      |                                                        |
| claim_success            | type, tx_hash, amount_sol, wallet_address                              |                                                        |
| claim_error              | error_code - error message, wallet_address                             |                                                        |
| stake_button_click       | amount_sol, wallet_address                                             |                                                        |
| stake_success            | tx_hash, amount_sol, wallet_address                                    |                                                        |
| stake_error              | error_code - error message, wallet_address                             |                                                        |
| click_max_unstake_button | max_sol, wallet_address                                                |                                                        |
| unstake_initiated        | amount_sol, wallet_address                                             | (click "Confirm unstake", instead of opening the form) |
| unstake_success          | tx_hash, amount_sol, remaining_sol, is_full_withdrawal, wallet_address |                                                        |
| unstake_all_success      | tx_hash, amount_sol, wallet_address                                    |                                                        |
| unstake_error            | error_code - error message, wallet_address                             |                                                        |
| wallet_connect_click     | - no params -                                                          |                                                        |
| wallet_connected         | wallet_address                                                         |                                                        |

Пожалуйста поястире различие между claim_initiate и claim_reward_click?

---

App Page View - [https://docs.formo.so/sdks/mobile#track-screen-views](https://docs.formo.so/sdks/mobile#track-screen-views)
Use the screen() method to track screen views — the mobile equivalent of page views

App Page View - в каком формате отправлять имя станицы, просто как имя?

| url                            | Name                  |
| ------------------------------ | --------------------- |
| /index                         | Splash                |
| /splash                        | Splash                |
| /greeting                      | Greeting              |
| /tabs                          | Home                  |
| /tabs/leaderboard              | Stats                 |
| /tabs/rewards                  | Rewards               |
| /tabs/faq                      | FAQ                   |
| /tabs/settings                 | Settings              |
| /screens/leaderboard-detail    | Leaderboard detail    |
| /screens/notification-settings | Notification settings |
| /screens/contact-us            | Contact us            |
| /no-internet/index             | No internet           |

---

Касательно идентификации кошелька пользователя в formo

https://docs.formo.so/sdks/mobile#identify-users

Используя identify я не могу установить address как Solana wallet, для полностью корректной работы formo с пользователем.

При анализе их пакета "@formo/analytics-react-native": "^0.1.4".
Я нашел, что адрес может быть любой строкой

// Address (EVM, Solana, etc.)
export type Address = string;

Но, на более глубоком уровне есть валидация, которая принимает только EVM адреса.

// Check if a string is a valid Ethereum address

export function isValidAddress(address: string): boolean {
if (!address) return false;
if (typeof address !== "string") return false;

// Check if it matches basic hex address format
return /^0x[a-fA-F0-9]{40}$/.test(address);
}

Я написал им в потдержу об этом, но когда будет ответ неизвестно.
