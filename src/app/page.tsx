"use client";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import BottomNavigationBar from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateRandomNumber,
  generateRandomNumberLessThan,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveRight, RefreshCcwDotIcon, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type MathQuiz = {
  startTime: Date;
  quiz: Quiz[];
  endTime?: Date;
};

type Quiz = {
  question: string;
  expressions: Expression[];
  suggestedAnswer: number;
  answer: number | null;
  isCorrect?: boolean;
};

type Operations = "+" | "-" | "x" | "÷";

type OPERATION = {
  eq: Operations;
  sub: Operations;
  add: Operations;
  mul: Operations;
  divide: Operations;
};

function getRandomOperation(): Operations {
  // Get all operation values as an array
  const operationValues: Operations[] = ["+", "-", "x"];

  // Return a random operation from the array
  return operationValues[Math.floor(Math.random() * operationValues.length)];
}

function generatePOMDASQuestion(numOperations = 1, maxDigit = 10): Quiz {
  const expressions: Expression[] = [];

  // Generate the first number
  expressions.push(generateRandomNumber(maxDigit) + 1);
  let lastNum = 0;
  for (let i = 0; i < numOperations; i++) {
    let op = getRandomOperation();
    let num =
      lastNum == 0
        ? generateRandomNumber()
        : generateRandomNumberLessThan(maxDigit, lastNum);
    expressions.push(op);
    expressions.push(num);
  }
  // Convert expressions to string representation
  const questionString = expressions
    .map((expr) => (typeof expr === "number" ? expr.toString() : expr))
    .join(" ");

  let suggestedAnswer = solvePOMDAS(expressions);
  return {
    question: questionString,
    expressions,
    suggestedAnswer,
    answer: null,
  };
}

type Expression = number | "+" | "-" | "x" | "÷";

function solvePOMDAS(exps: Expression[]): number {
  let result: number | undefined;
  let currentOperation: "+" | "-" | "x" | "÷" | undefined;

  for (let i = 0; i < exps.length; i++) {
    const currentExp = exps[i];

    if (typeof currentExp === "number") {
      if (result === undefined) {
        result = currentExp;
      } else {
        if (currentOperation === "+") {
          result += currentExp;
        } else if (currentOperation === "-") {
          result -= currentExp;
        } else if (currentOperation === "x") {
          result *= currentExp;
        } else if (currentOperation === "÷") {
          result /= currentExp;
        } else {
          throw new Error("Invalid operation encountered");
        }
      }
    } else {
      currentOperation = currentExp as "+" | "-" | "x" | "÷";
    }
  }

  if (result === undefined) {
    throw new Error("No valid expression found");
  }

  return result;
}

function evaluateExpression(qz: Quiz): boolean {
  if (Number(qz.suggestedAnswer) === Number(qz.answer)) {
    return true;
  } else {
    return false;
  }
}

function getTimeDifference(date1 = new Date(), date2: Date): string {
  // Get the time difference in milliseconds
  const milliDiff = date2.getTime() - date1.getTime();

  // Calculate seconds, minutes, and hours from milliseconds
  const totalSeconds = Math.floor(milliDiff / 1000);
  const remainingSeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / (60 * 60));

  // Format the time difference string (HH:MM:SS) with leading zeros
  const formattedTime = `${hours.toString().padStart(2, "0")}:${totalMinutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

  return formattedTime;
}

export default function Home() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<MathQuiz | null>();
  const [isEvalued, setIsEvalued] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [time, setTime] = useState("00:00:00");
  const [finalText, setFinalText] = useState("");
  useEffect(() => {
    setQuestions(null);
    let quis = [];
    for (let i = 0; i < 20; i++) {
      let q = generatePOMDASQuestion();
      quis.push(q);
    }
    const mQ: MathQuiz = {
      startTime: new Date(),
      quiz: quis,
    };
    setQuestions(mQ);
    setIsEvalued(false);
    // title: ``,
    setFinalText("");
  }, [refresh]);

  useEffect(() => {
    if (!questions?.startTime) return;

    const intervalId = setInterval(() => {
      const timeDifference = getTimeDifference(questions.startTime, new Date());
      setTime(timeDifference);
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [questions?.startTime, refresh]);

  function validateAndSaveToLocalStorage() {
    let qs = structuredClone(questions);
    qs?.quiz.forEach((q) => {
      if (evaluateExpression(q)) {
        q.isCorrect = true;
      } else {
        q.isCorrect = false;
      }
    });
    if (qs) {
      qs.endTime = new Date();
    }
    let name = "QUIZ" + qs?.startTime.toISOString();
    localStorage.setItem(name, JSON.stringify(qs));
    setIsEvalued(true);
    setQuestions(qs);

    const correctCount = qs?.quiz.filter((q) => q.isCorrect);
    toast({
      title: `Solved: ${correctCount?.length} are correct from ${qs?.quiz.length}`,
    });
    setFinalText(
      `Solved: ${Number(correctCount?.length)} are correct from ${
        qs?.quiz.length
      }`
    );
  }
  return (
    <main className="relative  p-1">
      <h1 className="pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 flex items-center  gap-2">
        Macer <MoveRight />
      </h1>
      <div className="flex gap-2 justify-between">
        <h2 className="pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          {time}
        </h2>
        <Button
          onClick={() => {
            setRefresh(refresh + 1);
          }}
        >
          <RefreshCcwDotIcon />
        </Button>
      </div>
      {questions != null ? (
        questions.quiz.map((q, index) => {
          return (
            <div
              key={index}
              className={`mx-j border my-1 ${
                isEvalued && q.isCorrect == false
                  ? "border-red-500 animate-pulse"
                  : ""
              }`}
            >
              <br />
              <h2 className="pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                {q.question}
              </h2>

              <Input
                type="text"
                value={String(q.answer)}
                onChange={(event) => {
                  let value = Number(event.target.value);
                  const qClone = structuredClone(questions.quiz);
                  qClone[index].answer = value;
                  setQuestions((prev: any) => {
                    return {
                      ...prev,
                      quiz: qClone,
                    };
                  });
                }}
              />
            </div>
          );
        })
      ) : (
        <>Genarting Question</>
      )}
      <Button
        className="mt-10"
        onClick={() => {
          validateAndSaveToLocalStorage();
        }}
      >
        Submit
      </Button>
      <br />
      {finalText}
    </main>
  );
}
