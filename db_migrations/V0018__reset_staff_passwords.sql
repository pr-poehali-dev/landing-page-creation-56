UPDATE staff SET pass_hash = 'e0a44a494f1d4f7551b6ed597970df1f194b97a494fbb895685fac573d20d1d6', pass_salt = '23ef266d043635b3', must_change = TRUE, active = TRUE WHERE id = 1;
UPDATE staff SET pass_hash = 'b58049e82fd18c193787d4bfe98e3b49889e86a4b408af6d10156f98eb8d4c79', pass_salt = 'ab42ba8c8af9a59b', must_change = TRUE, active = TRUE WHERE id = 2;
UPDATE staff SET pass_hash = '89f611852953f58e9b6de099a5c13e22b4325dcfb51141524e13df56219811e5', pass_salt = 'f23a55a2a16b4486', must_change = TRUE, active = TRUE WHERE id = 3;
UPDATE staff SET pass_hash = 'c8a3e2d4ff8cfac04063b00692d13b9ef90b362e69c31495d8579d9021e548c3', pass_salt = '48ac5fc4e1e03fa4', must_change = TRUE, active = TRUE WHERE id = 4;
UPDATE staff_sessions SET revoked = TRUE WHERE revoked = FALSE;