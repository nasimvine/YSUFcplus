"use strict";

const YusufProblems = [
    {
        id: 1,
        title: "Салом, ҷаҳон!",
        level: "Осон",
        points: 10,
        description: "Барнома нависед, ки матни Hello World! -ро чоп кунад.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    // Кодро ин ҷо нависед

    return 0;
}`,
        expectedOutput: "Hello World!",
        hint: "Барои чоп кардани матн аз cout истифода баред.",
        solution:
`cout << "Hello World!" << endl;`
    },

    {
        id: 2,
        title: "Ҷамъи ду адад",
        level: "Осон",
        points: 10,
        description: "Ду адад гирифта, ҷамъбасти онҳоро нишон диҳед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // Ҷамъро ҳисоб кунед

    return 0;
}`,
        expectedOutput: "12",
        hint: "a + b-ро ҳисоб карда, бо cout нишон диҳед.",
        solution:
`cout << a + b << endl;`
    },

    {
        id: 3,
        title: "Адади ҷуфт ё тоқ",
        level: "Осон",
        points: 15,
        description: "Муайян кунед, ки адади додашуда ҷуфт аст ё тоқ.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // if / else истифода баред

    return 0;
}`,
        expectedOutput: "Even",
        hint: "Агар n % 2 == 0 бошад, адад ҷуфт аст.",
        solution:
`if (n % 2 == 0) {
    cout << "Even";
} else {
    cout << "Odd";
}`
    },

    {
        id: 4,
        title: "Калонтарин адад",
        level: "Осон",
        points: 15,
        description: "Аз ду адад адади калонтаринро пайдо кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // Калонтарин ададро пайдо кунед

    return 0;
}`,
        expectedOutput: "10",
        hint: "Аз if истифода баред ё std::max.",
        solution:
`if (a > b) {
    cout << a;
} else {
    cout << b;
}`
    },

    {
        id: 5,
        title: "Ҷамъи 1 то N",
        level: "Миёна",
        points: 20,
        description: "Ҷамъи ҳамаи ададҳои аз 1 то N-ро ҳисоб кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;

    // Циклро нависед

    cout << sum;

    return 0;
}`,
        expectedOutput: "15",
        hint: "Аз for истифода баред.",
        solution:
`for (int i = 1; i <= n; i++) {
    sum += i;
}`
    },

    {
        id: 6,
        title: "Таблитсаи зарб",
        level: "Миёна",
        points: 20,
        description: "Таблитсаи зарби адади N-ро аз 1 то 10 чоп кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Таблитсаи зарб

    return 0;
}`,
        expectedOutput: "5 10 15 20 25 30 35 40 45 50",
        hint: "for аз 1 то 10 истифода баред.",
        solution:
`for (int i = 1; i <= 10; i++) {
    cout << n * i << " ";
}`
    },

    {
        id: 7,
        title: "Шумораи элементҳои ҷуфт",
        level: "Миёна",
        points: 25,
        description: "Дар массив шумораи элементҳои ҷуфтро ҳисоб кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int a[100];
    int count = 0;

    // Массивро хонед ва ҷуфтҳоро ҳисоб кунед

    cout << count;

    return 0;
}`,
        expectedOutput: "3",
        hint: "Барои ҳар элемент a[i] % 2 == 0-ро санҷед.",
        solution:
`for (int i = 0; i < n; i++) {
    cin >> a[i];

    if (a[i] % 2 == 0) {
        count++;
    }
}`
    },

    {
        id: 8,
        title: "Максимуми массив",
        level: "Миёна",
        points: 25,
        description: "Калонтарин элементро дар массив пайдо кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int a[100];

    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // Максимумро пайдо кунед

    return 0;
}`,
        expectedOutput: "9",
        hint: "Аввалин элементро ҳамчун max гиред ва баъд муқоиса кунед.",
        solution:
`int maxValue = a[0];

for (int i = 1; i < n; i++) {
    if (a[i] > maxValue) {
        maxValue = a[i];
    }
}

cout << maxValue;`
    },

    {
        id: 9,
        title: "Функсияи ҷамъ",
        level: "Миёна",
        points: 25,
        description: "Функсия созед, ки ду ададро ҷамъ мекунад.",
        starterCode:
`#include <iostream>
using namespace std;

// Функсияро ин ҷо созед

int main() {
    cout << add(5, 7);

    return 0;
}`,
        expectedOutput: "12",
        hint: "Функсия бояд ду int қабул карда, int баргардонад.",
        solution:
`int add(int a, int b) {
    return a + b;
}`
    },

    {
        id: 10,
        title: "Баръакс кардани рақам",
        level: "Мушкил",
        points: 30,
        description: "Рақами додашударо баръакс кунед.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int reversed = 0;

    // Рақамро баръакс кунед

    cout << reversed;

    return 0;
}`,
        expectedOutput: "321",
        hint: "Бо % 10 рақами охиринро гиред ва бо / 10 рақамро кӯтоҳ кунед.",
        solution:
`while (n > 0) {
    int digit = n % 10;
    reversed = reversed * 10 + digit;
    n /= 10;
}`
    },

    {
        id: 11,
        title: "Палиндром",
        level: "Мушкил",
        points: 35,
        description: "Муайян кунед, ки рақам аз ду тараф якхел хонда мешавад ё не.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int original = n;
    int reversed = 0;

    // Рақамро баръакс кунед

    if (original == reversed) {
        cout << "YES";
    } else {
        cout << "NO";
    }

    return 0;
}`,
        expectedOutput: "YES",
        hint: "Аввал n-ро баръакс кунед ва бо original муқоиса намоед.",
        solution:
`while (n > 0) {
    reversed = reversed * 10 + n % 10;
    n /= 10;
}`
    },

    {
        id: 12,
        title: "FizzBuzz",
        level: "Мушкил",
        points: 40,
        description: "Аз 1 то N ададҳоро чоп кунед. Барои 3 Fizz, барои 5 Buzz ва барои ҳарду FizzBuzz.",
        starterCode:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // FizzBuzz

    return 0;
}`,
        expectedOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz",
        hint: "Аввал шартро барои 3 ва 5 якҷоя санҷед.",
        solution:
`for (int i = 1; i <= n; i++) {
    if (i % 3 == 0 && i % 5 == 0) {
        cout << "FizzBuzz ";
    } else if (i % 3 == 0) {
        cout << "Fizz ";
    } else if (i % 5 == 0) {
        cout << "Buzz ";
    } else {
        cout << i << " ";
    }
}`
    }
];

window.YusufProblems = YusufProblems;
