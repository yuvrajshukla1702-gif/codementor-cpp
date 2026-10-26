declare module "JSCPP" {
  const JSCPP: {
    run: (
      code: string,
      input: string,
      config: { stdio: { write: (text: string) => void }; maxTimeout: number },
    ) => number;
  };
  export default JSCPP;
}
