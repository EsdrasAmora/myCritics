import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from "@chakra-ui/core"
import { useField } from "formik"
import React, { InputHTMLAttributes } from "react"

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; textArea?: boolean }

export const InputField: React.FC<InputFieldProps> = ({ label, textArea, size: _, ...props }) => {
	let InputOrTextarea = Input
	if (textArea) {
		InputOrTextarea = Textarea
	}
	const [field, { error }] = useField(props)
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<InputOrTextarea {...field} {...props} id={field.name} placeholder={label} />
			{error && <FormErrorMessage>{error}</FormErrorMessage>}
		</FormControl>
	)
}
