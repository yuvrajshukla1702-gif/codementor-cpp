/** Languages the online compiler will run, on the Wandbox sandbox. */

export const COMPILER_LANGS = [
  {
    id: "cpp",
    label: "C++",
    compiler: "gcc-13.2.0",
    options: "gnu++17",
    file: "main.cpp",
    monaco: "cpp",
    stdin: "4 5\n",
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`,
  },
  {
    id: "c",
    label: "C",
    compiler: "gcc-13.2.0-c",
    options: "",
    file: "main.c",
    monaco: "c",
    stdin: "4 5\n",
    code: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}
`,
  },
  {
    id: "python",
    label: "Python",
    compiler: "cpython-3.12.7",
    options: "",
    file: "main.py",
    monaco: "python",
    stdin: "4 5\n",
    code: `a, b = map(int, input().split())
print(a + b)
`,
  },
  {
    id: "java",
    label: "Java",
    compiler: "openjdk-jdk-21+35",
    options: "",
    file: "Main.java",
    monaco: "java",
    stdin: "4 5\n",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int a = in.nextInt();
        int b = in.nextInt();
        System.out.println(a + b);
    }
}
`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    compiler: "nodejs-20.17.0",
    options: "",
    file: "main.js",
    monaco: "javascript",
    stdin: "4 5\n",
    code: `const fs = require("fs");
const [a, b] = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
console.log(a + b);
`,
  },
] as const;

export type CompilerLangId = (typeof COMPILER_LANGS)[number]["id"];

export function compilerLang(id: string) {
  return COMPILER_LANGS.find((l) => l.id === id);
}
