export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (!v) return "Укажите телефон";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) {
    return `В номере не хватает цифр: нужно 10, сейчас ${digits.length}`;
  }
  if (digits.length === 10) return null;
  if (digits.length === 11) {
    if (digits[0] !== "7" && digits[0] !== "8") return "Российский номер начинается с +7 или 8";
    return null;
  }
  return "Слишком длинный номер — проверьте, нет ли лишних цифр";
}

export function validateInn(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/\D/.test(v)) return "ИНН состоит только из цифр";
  if (v.length !== 10 && v.length !== 12) {
    return `ИНН должен содержать 10 цифр у организации или 12 у ИП, сейчас ${v.length}`;
  }
  return checkInnChecksum(v) ? null : "ИНН введён с ошибкой — проверьте цифры";
}

function innSum(digits: string, weights: number[]): number {
  return weights.reduce((acc, w, i) => acc + w * Number(digits[i]), 0);
}

function checkInnChecksum(inn: string): boolean {
  if (inn.length === 10) {
    const n = innSum(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]) % 11 % 10;
    return n === Number(inn[9]);
  }
  const n1 = innSum(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) % 11 % 10;
  const n2 = innSum(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) % 11 % 10;
  return n1 === Number(inn[10]) && n2 === Number(inn[11]);
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!v.includes("@")) return "В адресе должен быть знак @ — например client@mail.ru";
  const [local, ...rest] = v.split("@");
  const domain = rest.join("@");
  if (rest.length > 1) return "В адресе не может быть двух знаков @";
  if (!local) return "Перед знаком @ должно быть имя ящика";
  if (!domain.includes(".")) return "После @ укажите домен с точкой — например mail.ru";
  if (/\s/.test(v)) return "В адресе не должно быть пробелов";
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return "Проверьте адрес — похоже, он введён с ошибкой";
  return null;
}

export function validateKpp(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/\D/.test(v)) return "КПП состоит только из цифр";
  if (v.length !== 9) return `КПП содержит 9 цифр, сейчас ${v.length}`;
  return null;
}

export function validateOgrn(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/\D/.test(v)) return "ОГРН состоит только из цифр";
  if (v.length !== 13 && v.length !== 15) {
    return `ОГРН содержит 13 цифр, ОГРНИП — 15, сейчас ${v.length}`;
  }
  return null;
}

export function validateAccount(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/\D/.test(v)) return "Счёт состоит только из цифр";
  if (v.length !== 20) return `Расчётный счёт содержит 20 цифр, сейчас ${v.length}`;
  return null;
}

export function validateBik(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/\D/.test(v)) return "БИК состоит только из цифр";
  if (v.length !== 9) return `БИК содержит 9 цифр, сейчас ${v.length}`;
  return null;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  if (!d.startsWith("7") || d.length !== 11 || d[1] !== "9") return value.trim();
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}