import { useState } from "react";

export default function useForm(action: (formData: FormData) => Promise<{ message: string, success?: boolean }>,
    initialState: { message: string }) {
    const [pending, setPending] = useState(false);
    const [state, setState] = useState<{ message: string, success?: boolean }>(initialState);

    const handleSubmit = async (formData: FormData) => {
        setPending(true);
        const result = await action(formData);
        setState(result);
        setPending(false);
    }

    return [state, handleSubmit, pending] as const;
}