import SignContractGate from './SignContractGate';

export default async function SignContractPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <SignContractGate token={token} />;
}
