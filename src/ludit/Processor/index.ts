import TreeNode from "../TreeNode";

/**
* compute root TreeNode, the TreeNode will then recursively compute children TreeNodes and Tokens
*
*   @param tree - The root TreeNode
*   @param profile - The expression's profile
*   @param _input - The input bits, represented as numbers
*
*   @returns The resulting bit of the computation
*/
function calculate(
  tree: TreeNode,
  profile: string,
  _input: number[],
): boolean {
  // Convert number input to boolean input
  const input: boolean[] = _input.map((b) => Boolean(b));

  return tree
    .copy()
    .calculate(
      input,
      profile,
    );
}

export default { calculate };
