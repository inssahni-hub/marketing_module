import React, { useRef } from "react"
import JoditEditor from "jodit-react"
import { Label } from "@/components/ui/label"

export default function RichTextEditorCard({
  title,
  description,
  value,
  onChange,
  placeholder = "Write here...",
  height = 280,
}) {
  const editorRef = useRef(null)

  return (
    <div className="space-y-4 border rounded-xl p-5">

      <div>
        <h3 className="text-base font-semibold">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <JoditEditor
          ref={editorRef}
          value={value}
          config={{
            height,
            readonly: false,
            toolbarSticky: false,

            placeholder,

            buttons: [
              "bold",
              "italic",
              "underline",
              "|",
              "ul",
              "ol",
              "|",
              "link",
              "|",
              "undo",
              "redo",
              "|",
              "cleanhtml",
            ],

            askBeforePasteHTML: false,
            askBeforePasteFromWord: false,
            defaultActionOnPaste: "insert_only_text",
            pasteHTMLActionList: ["insert_only_text"],

            cleanHTML: {
              removeTags: [
                "script",
                "style",
                "form",
                "input",
                "iframe",
                "object",
              ],
              fillEmptyParagraph: false,
            },
          }}
          onBlur={(newContent) => {
            onChange(newContent)
          }}
        />
      </div>

    </div>
  )
}