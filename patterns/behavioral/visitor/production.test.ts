import { describe, it, expect } from "vitest";
import {
  ProgramNode,
  FunctionDeclNode,
  VariableDeclNode,
  CallExpressionNode,
  ReturnStatementNode,
  MetricsVisitor,
  PrettyPrintVisitor,
} from "./production";

describe("Visitor — AST Code Analysis", () => {
  // Helper: build a small AST
  function makeAST() {
    return new ProgramNode([
      new FunctionDeclNode("greet", ["name"], [
        new VariableDeclNode("msg", "const", new CallExpressionNode("concat", [])),
        new ReturnStatementNode(new CallExpressionNode("log", [])),
      ]),
      new VariableDeclNode("x", "var"),
      new FunctionDeclNode("fetchData", ["url"], [
        new ReturnStatementNode(),
      ], true),
    ]);
  }

  describe("MetricsVisitor", () => {
    it("counts functions", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      expect(visitor.metrics.functionCount).toBe(2);
    });

    it("counts async functions", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      expect(visitor.metrics.asyncFunctionCount).toBe(1);
    });

    it("counts variables", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      // "msg" (const) inside greet + "x" (var) at top level
      expect(visitor.metrics.variableCount).toBe(2);
    });

    it("counts var usage", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      expect(visitor.metrics.varUsageCount).toBe(1);
    });

    it("counts call expressions", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      // concat (in variable init) + log (in return)
      expect(visitor.metrics.callCount).toBe(2);
    });

    it("counts return statements", () => {
      const visitor = new MetricsVisitor();
      makeAST().accept(visitor);
      expect(visitor.metrics.returnCount).toBe(2);
    });

    it("empty program has zero metrics", () => {
      const visitor = new MetricsVisitor();
      new ProgramNode([]).accept(visitor);
      expect(visitor.metrics.functionCount).toBe(0);
      expect(visitor.metrics.variableCount).toBe(0);
      expect(visitor.metrics.callCount).toBe(0);
    });
  });

  describe("PrettyPrintVisitor", () => {
    it("prints a simple function declaration", () => {
      const visitor = new PrettyPrintVisitor();
      const ast = new ProgramNode([
        new FunctionDeclNode("hello", [], [
          new ReturnStatementNode(),
        ]),
      ]);
      const output = ast.accept(visitor);
      expect(output).toContain("function hello()");
      expect(output).toContain("return;");
    });

    it("prints async function with async prefix", () => {
      const visitor = new PrettyPrintVisitor();
      const ast = new ProgramNode([
        new FunctionDeclNode("fetch", ["url"], [], true),
      ]);
      const output = ast.accept(visitor);
      expect(output).toContain("async function fetch(url)");
    });

    it("prints variable declarations", () => {
      const visitor = new PrettyPrintVisitor();
      const ast = new ProgramNode([
        new VariableDeclNode("count", "let"),
        new VariableDeclNode("PI", "const"),
      ]);
      const output = ast.accept(visitor);
      expect(output).toContain("let count;");
      expect(output).toContain("const PI;");
    });

    it("prints variable with initializer", () => {
      const visitor = new PrettyPrintVisitor();
      const ast = new ProgramNode([
        new VariableDeclNode("result", "const", new CallExpressionNode("getValue", [])),
      ]);
      const output = ast.accept(visitor);
      expect(output).toContain("const result = getValue();");
    });

    it("prints return with argument", () => {
      const visitor = new PrettyPrintVisitor();
      const ast = new ProgramNode([
        new FunctionDeclNode("test", [], [
          new ReturnStatementNode(new CallExpressionNode("compute", [])),
        ]),
      ]);
      const output = ast.accept(visitor);
      expect(output).toContain("return compute();");
    });

    it("call expression with args", () => {
      const visitor = new PrettyPrintVisitor();
      const node = new CallExpressionNode("add", [
        new CallExpressionNode("x", []),
        new CallExpressionNode("y", []),
      ]);
      const output = node.accept(visitor);
      expect(output).toBe("add(x(), y())");
    });
  });

  it("each node kind is set correctly", () => {
    expect(new ProgramNode([]).kind).toBe("Program");
    expect(new FunctionDeclNode("f", [], []).kind).toBe("FunctionDecl");
    expect(new VariableDeclNode("v", "let").kind).toBe("VariableDecl");
    expect(new CallExpressionNode("c", []).kind).toBe("CallExpression");
    expect(new ReturnStatementNode().kind).toBe("ReturnStatement");
  });
});
