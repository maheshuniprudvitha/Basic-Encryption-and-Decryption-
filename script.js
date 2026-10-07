"use strict";

const inputText = document.getElementById("inputText");
const encryptionKey = document.getElementById("encryptionKey");
const resultText = document.getElementById("resultText");
const characterCount = document.getElementById("characterCount");
const resultStatus = document.getElementById("resultStatus");
const resultStatusDot = document.getElementById("resultStatusDot");
const message = document.getElementById("message");

function normalizeKey(key) {
  return ((key % 26) + 26) % 26;
}

function shiftText(text, shift) {
  return Array.from(text, (character) => {
    const code = character.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }

    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }

    return character;
  }).join("");
}

function showMessage(text, isError) {
  message.textContent = text;
  message.classList.toggle("is-error", isError);
}

function updateStatus(status) {
  resultStatus.textContent = status;
  resultStatusDot.classList.toggle("status-light-muted", status === "Ready");
}

function validateInputs() {
  const text = inputText.value;
  const keyValue = encryptionKey.value.trim();

  if (text.length === 0) {
    showMessage("Please enter some text.", true);
    inputText.focus();
    return null;
  }

  if (keyValue === "") {
    showMessage("Please enter an encryption key.", true);
    encryptionKey.focus();
    return null;
  }

  const key = Number(keyValue);
  if (!Number.isFinite(key) || !Number.isInteger(key)) {
    showMessage("Encryption key must be a whole number.", true);
    encryptionKey.focus();
    return null;
  }

  return { text, key: normalizeKey(key) };
}

function processText(direction) {
  const values = validateInputs();
  if (!values) {
    return;
  }

  const shift = direction === "encrypt" ? values.key : normalizeKey(-values.key);
  resultText.value = shiftText(values.text, shift);
  const status = direction === "encrypt" ? "Encrypted" : "Decrypted";
  updateStatus(status);
  showMessage(`Text ${direction === "encrypt" ? "encrypted" : "decrypted"} successfully!`, false);
}

async function copyResult() {
  if (!resultText.value) {
    showMessage("There is no result to copy.", true);
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(resultText.value);
    } else {
      resultText.focus();
      resultText.select();
      const copied = document.execCommand("copy");
      resultText.setSelectionRange(0, 0);
      resultText.blur();

      if (!copied) {
        throw new Error("Clipboard copy command was unsuccessful.");
      }
    }

    showMessage("✓ Result copied successfully!", false);
  } catch (error) {
    console.error("Unable to copy the result to the clipboard:", error);
    showMessage("Unable to copy the result. Please select and copy it manually.", true);
  }
}

function clearTool() {
  inputText.value = "";
  encryptionKey.value = "3";
  resultText.value = "";
  characterCount.textContent = "0";
  updateStatus("Ready");
  showMessage("", false);
  inputText.focus();
}

document.getElementById("encryptButton").addEventListener("click", () => processText("encrypt"));
document.getElementById("decryptButton").addEventListener("click", () => processText("decrypt"));
document.getElementById("copyButton").addEventListener("click", copyResult);
document.getElementById("clearButton").addEventListener("click", clearTool);

inputText.addEventListener("input", () => {
  characterCount.textContent = String(inputText.value.length);
});

encryptionKey.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    processText("encrypt");
  }
});
