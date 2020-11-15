import * as monaco from "monaco-editor-core";
import { languageExtensionPoint, languageID } from "./config";
import { monarchLanguage, language } from "./ManimDSL";

export function setupLanguage() {
    (window as any).MonacoEnvironment = {
        getWorkerUrl: function () {
            return './editor.worker.js';
        }
    }
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
        monaco.languages.setLanguageConfiguration(languageID, monarchLanguage );
        monaco.languages.setMonarchTokensProvider(languageID, language );
    });
}
