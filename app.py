import random

from flask import Flask, jsonify, render_template

app = Flask(__name__)


def generate_problem():
    """Generate a 3-digit ÷ 1-digit division problem with no remainder,
    where every intermediate step already divides cleanly (first digit
    of the dividend is >= divisor), matching the classic oppstilt
    divisjon layout: e.g. 465 : 3 = 155.
    """
    for _ in range(5000):
        divisor = random.randint(2, 9)
        quotient = random.randint(100, 999)
        dividend = divisor * quotient

        if not (100 <= dividend <= 999):
            continue

        digits = [int(c) for c in str(dividend)]
        if digits[0] < divisor:
            continue

        return build_problem(dividend, divisor)

    # Fallback, should not normally happen
    return build_problem(465, 3)


def build_problem(dividend, divisor):
    digits = [int(c) for c in str(dividend)]

    remainder = 0
    steps = []
    for digit in digits:
        current = remainder * 10 + digit
        quotient_digit = current // divisor
        multiply_result = quotient_digit * divisor
        new_remainder = current - multiply_result

        steps.append(
            {
                "brought_down_digit": digit,
                "current_value": current,
                "quotient_digit": quotient_digit,
                "multiply_result": multiply_result,
                "remainder_after": new_remainder,
            }
        )
        remainder = new_remainder

    quotient = int("".join(str(s["quotient_digit"]) for s in steps))

    return {
        "dividend": dividend,
        "divisor": divisor,
        "quotient": quotient,
        "steps": steps,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/problem")
def api_problem():
    return jsonify(generate_problem())


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
