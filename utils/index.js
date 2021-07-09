export function declension(num, titles) {
  const number = parseInt(num);
  const  cases = [2, 0, 1, 1, 1, 2]
  const declination = titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
    ];

  return `${declination}`;
}

export function contains(target, pattern) {
  let flag = false;

  for (let i = 0; i < pattern.length; i++ ) {
    flag = target.includes(pattern[i]);
    if (flag) break;
  }

  return flag;
}

