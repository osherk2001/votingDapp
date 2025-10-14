# 🤝 Contributing to Voting DApp

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Follow professional communication standards

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/votingDapp.git
cd votingDapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Workflow

### 1. Make Changes

- Edit code in appropriate directory
- Follow existing patterns
- Add tests for new features

### 2. Run Tests

```bash
npm test
```

**All tests must pass before submitting PR.**

### 3. Compile

```bash
npm run compile
```

### 4. Lint & Format

```bash
npm run lint
npm run format
```

### 5. Commit

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Convention](#commit-convention) below.

### 6. Push

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Fill in template
- Request review

## Coding Standards

### Solidity

**Style:**
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments
- 4 spaces indentation
- Max 120 characters per line

**Example:**
```solidity
/**
 * @notice Adds a new candidate to the election
 * @param name The candidate's name
 * @param positions Policy positions [0-100] for 3 topics
 * @return id The newly created candidate ID
 */
function addCandidate(
    string memory name,
    uint8[3] memory positions
) external onlyOwner returns (uint256 id) {
    // Implementation
}
```

**Security:**
- Use OpenZeppelin contracts
- Add reentrancy guards where needed
- Validate all inputs
- Use custom errors (gas efficient)
- Follow checks-effects-interactions pattern

### TypeScript

**Style:**
- 2 spaces indentation
- Semicolons required
- Double quotes for strings
- Use `const` over `let`
- Explicit return types

**Example:**
```typescript
async function deployContracts(): Promise<{
  balToken: BALToken;
  voting: Voting;
}> {
  const BALTokenFactory = await ethers.getContractFactory("BALToken");
  const balToken = await BALTokenFactory.deploy("BAL Token", "BAL");
  
  return { balToken, voting };
}
```

**Type Safety:**
- No `any` types
- Enable strict mode
- Use TypeChain generated types
- Handle errors properly

## Testing Guidelines

### Structure

```typescript
describe("ContractName", function () {
  describe("FunctionName", function () {
    it("Should do expected behavior", async function () {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = await contract.function(input);
      
      // Assert
      expect(result).to.equal(expected);
    });
  });
});
```

### Coverage

- **Minimum:** 80% code coverage
- Test happy paths
- Test edge cases
- Test error conditions
- Test access control

### Example

```typescript
describe("vote", function () {
  it("Should allow whitelisted voter to vote", async function () {
    await voting.connect(voter1).vote(1, voter1Proof);
    expect(await voting.voted(1, voter1.address)).to.be.true;
  });

  it("Should revert if voter not whitelisted", async function () {
    await expect(
      voting.connect(nonWhitelisted).vote(1, [])
    ).to.be.revertedWithCustomError(voting, "NotWhitelisted");
  });
});
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactor (no feature/fix)
- `test`: Add/update tests
- `chore`: Maintenance (deps, config, etc.)
- `perf`: Performance improvement
- `ci`: CI/CD changes

### Scopes

- `contracts`: Smart contracts
- `scripts`: Deployment/management scripts
- `tests`: Test files
- `frontend`: Frontend code
- `config`: Configuration files

### Examples

```bash
# New feature
git commit -m "feat(contracts): add candidate deactivation function"

# Bug fix
git commit -m "fix(scripts): correct Merkle proof generation for checksummed addresses"

# Documentation
git commit -m "docs: add deployment guide for Sepolia"

# Tests
git commit -m "test(contracts): add edge cases for vote timing"

# Refactor
git commit -m "refactor(scripts): extract Merkle generation to utility function"
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code compiles (`npm run compile`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] New tests added (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] Commits follow convention
- [ ] Branch is up to date with `main`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated Checks:** CI runs tests, linting
2. **Code Review:** Maintainer reviews code
3. **Feedback:** Address review comments
4. **Approval:** PR approved by maintainer
5. **Merge:** Squash and merge to `main`

## Areas for Contribution

### High Priority

- [ ] Gas optimization in contracts
- [ ] Additional test coverage
- [ ] Frontend implementation
- [ ] Multi-language support (i18n)
- [ ] Security audit findings

### Medium Priority

- [ ] Improved error messages
- [ ] Additional management scripts
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Example integrations

### Good First Issues

Look for issues labeled `good-first-issue` on GitHub.

## Development Setup

### Recommended VS Code Extensions

- **Solidity** - Juan Blanco
- **ESLint** - Microsoft
- **Prettier** - Prettier
- **EditorConfig** - EditorConfig

### Environment

```bash
# Node version
node -v  # Should be 18+

# Install dependencies
npm install

# Run tests in watch mode
npx hardhat test --watch

# Start local node
npm run node
```

## Questions?

- **Discussions:** [GitHub Discussions](https://github.com/osherk2001/votingDapp/discussions)
- **Issues:** [GitHub Issues](https://github.com/osherk2001/votingDapp/issues)
- **Email:** Open an issue instead for transparency

## Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute! 🎉
