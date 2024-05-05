export default function Price({
  amount,
  currencyCode,
}: {
  amount: number;
  currencyCode: string;
}) {
  return (
    <span>
      {currencyCode}
      &nbsp;
      {amount}
    </span>
  );
}
