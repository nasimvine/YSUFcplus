"use strict";

const YusufLessons = [
    {
        id: 1,
        title: "C++ чист?",
        level: "beginner",
        icon: "🚀",
        duration: "10 дақ.",
        description:
            "Шиносоӣ бо C++, сохтори барнома ва аввалин коди мо.",
        code:
`#include <iostream>

int main() {
    std::cout << "Салом, Юсуф!" << std::endl;
    return 0;
}`,
        explanation: [
            {
                title: "#include <iostream>",
                text:
                    "Китобхонаи iostream барои кор бо cout ва cin истифода мешавад."
            },
            {
                title: "int main()",
                text:
                    "Ин функсияи асосии барнома мебошад. Иҷрои барнома аз main оғоз мешавад."
            },
            {
                title: "std::cout",
                text:
                    "Барои нишон додани маълумот дар экран истифода мешавад."
            },
            {
                title: "return 0",
                text:
                    "Нишон медиҳад, ки барнома бе хато анҷом ёфт."
            }
        ]
    },

    {
        id: 2,
        title: "Тағйирёбандаҳо",
        level: "beginner",
        icon: "📦",
        duration: "12 дақ.",
        description:
            "Омӯзиши int, double, char, bool ва string.",
        code:
`#include <iostream>
#include <string>

int main() {
    int age = 18;
    double height = 1.80;
    std::string name = "Yusuf";
    bool student = true;

    std::cout << name << std::endl;
    std::cout << age << std::endl;

    return 0;
}`,
        explanation: [
            {
                title: "int",
                text:
                    "Барои ададҳои бутун истифода мешавад."
            },
            {
                title: "double",
                text:
                    "Барои ададҳои касрӣ истифода мешавад."
            },
            {
                title: "string",
                text:
                    "Барои нигоҳ доштани матн истифода мешавад."
            },
            {
                title: "bool",
                text:
                    "Танҳо true ё false қабул мекунад."
            }
        ]
    },

    {
        id: 3,
        title: "Input ва Output",
        level: "beginner",
        icon: "⌨️",
        duration: "15 дақ.",
        description:
            "Гирифтани маълумот аз корбар ва нишон додани натиҷа.",
        code:
`#include <iostream>

int main() {
    int age;

    std::cout << "Синну сол: ";
    std::cin >> age;

    std::cout << "Соли оянда: "
              << age + 1
              << std::endl;

    return 0;
}`,
        explanation: [
            {
                title: "std::cin",
                text:
                    "Маълумотро аз корбар қабул мекунад."
            },
            {
                title: ">>",
                text:
                    "Оператори ворид кардани маълумот ба тағйирёбанда мебошад."
            },
            {
                title: "<<",
                text:
                    "Оператори баровардани маълумот ба экран мебошад."
            }
        ]
    },

    {
        id: 4,
        title: "Шартҳо if / else",
        level: "beginner",
        icon: "🔀",
        duration: "15 дақ.",
        description:
            "Қарор қабул кардан бо if, else ва else if.",
        code:
`#include <iostream>

int main() {
    int age;

    std::cin >> age;

    if (age >= 18) {
        std::cout << "Шумо калонсол ҳастед";
    } else {
        std::cout << "Шумо ноболиғ ҳастед";
    }

    return 0;
}`,
        explanation: [
            {
                title: "if",
                text:
                    "Шартро месанҷад. Агар шарт дуруст бошад, блок иҷро мешавад."
            },
            {
                title: "else",
                text:
                    "Вақте истифода мешавад, ки шарт нодуруст бошад."
            },
            {
                title: "else if",
                text:
                    "Барои санҷидани якчанд шарт истифода мешавад."
            }
        ]
    },

    {
        id: 5,
        title: "Цикли for",
        level: "beginner",
        icon: "🔁",
        duration: "18 дақ.",
        description:
            "Такрор кардани амалҳо бо for.",
        code:
`#include <iostream>

int main() {
    for (int i = 1; i <= 5; i++) {
        std::cout << i << std::endl;
    }

    return 0;
}`,
        explanation: [
            {
                title: "int i = 1",
                text:
                    "Қимати аввалини ҳисобкунакро муайян мекунад."
            },
            {
                title: "i <= 5",
                text:
                    "Шартест, ки то кай цикл кор мекунад."
            },
            {
                title: "i++",
                text:
                    "Пас аз ҳар такрор i як адад зиёд мешавад."
            }
        ]
    },

    {
        id: 6,
        title: "Цикли while",
        level: "beginner",
        icon: "♻️",
        duration: "15 дақ.",
        description:
            "Такрори амалҳо бо while.",
        code:
`#include <iostream>

int main() {
    int i = 1;

    while (i <= 5) {
        std::cout << i << std::endl;
        i++;
    }

    return 0;
}`,
        explanation: [
            {
                title: "while",
                text:
                    "То вақте ки шарт true бошад, кодро такрор мекунад."
            },
            {
                title: "i++",
                text:
                    "Қимати i-ро зиёд мекунад ва барои пешгирии loop-и беохир муҳим аст."
            }
        ]
    },

    {
        id: 7,
        title: "Массивҳо",
        level: "intermediate",
        icon: "🧩",
        duration: "20 дақ.",
        description:
            "Нигоҳ доштани якчанд қимат дар як массив.",
        code:
`#include <iostream>

int main() {
    int numbers[5] = {
        10, 20, 30, 40, 50
    };

    for (int i = 0; i < 5; i++) {
        std::cout << numbers[i]
                  << std::endl;
    }

    return 0;
}`,
        explanation: [
            {
                title: "int numbers[5]",
                text:
                    "Массиве месозад, ки 5 элементи int дорад."
            },
            {
                title: "numbers[i]",
                text:
                    "Барои дастрасӣ ба элементи массив истифода мешавад."
            }
        ]
    },

    {
        id: 8,
        title: "Функсияҳо",
        level: "intermediate",
        icon: "⚙️",
        duration: "20 дақ.",
        description:
            "Тақсим кардани барнома ба функсияҳои алоҳида.",
        code:
`#include <iostream>

int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(5, 7);

    std::cout << result
              << std::endl;

    return 0;
}`,
        explanation: [
            {
                title: "int add",
                text:
                    "Функсияе месозад, ки натиҷаи типи int бармегардонад."
            },
            {
                title: "a ва b",
                text:
                    "Параметрҳои функсия мебошанд."
            },
            {
                title: "return",
                text:
                    "Натиҷаи ҳисобро ба қисми даъваткунандаи функсия бармегардонад."
            }
        ]
    },

    {
        id: 9,
        title: "std::vector",
        level: "intermediate",
        icon: "📚",
        duration: "20 дақ.",
        description:
            "Кор бо vector барои нигоҳ доштани рӯйхати динамикӣ.",
        code:
`#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {
        10, 20, 30
    };

    numbers.push_back(40);

    for (int number : numbers) {
        std::cout << number
                  << std::endl;
    }

    return 0;
}`,
        explanation: [
            {
                title: "vector",
                text:
                    "Контейнери динамикӣ мебошад."
            },
            {
                title: "push_back",
                text:
                    "Элементи навро ба охири vector илова мекунад."
            },
            {
                title: "for-each",
                text:
                    "Барои гузаштан аз ҳамаи элементҳо истифода мешавад."
            }
        ]
    },

    {
        id: 10,
        title: "Class ва Object",
        level: "intermediate",
        icon: "🏗️",
        duration: "25 дақ.",
        description:
            "Аввалин қадамҳо ба барномасозии объектӣ дар C++.",
        code:
`#include <iostream>
#include <string>

class User {
public:
    std::string name;

    void hello() {
        std::cout
            << "Салом "
            << name
            << std::endl;
    }
};

int main() {
    User user;

    user.name = "Yusuf";
    user.hello();

    return 0;
}`,
        explanation: [
            {
                title: "class",
                text:
                    "Шаблони объектро муайян мекунад."
            },
            {
                title: "object",
                text:
                    "Нусхаи class мебошад."
            },
            {
                title: "public",
                text:
                    "Қисмеро муайян мекунад, ки аз берун дастрас аст."
            }
        ]
    }
];

window.YusufLessons = YusufLessons;
