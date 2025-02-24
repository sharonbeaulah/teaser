from flask import Flask, request, jsonify, render_template
import psycopg2
import os

cert_path = os.path.expanduser("~/ssl/cert.pem")
key_path = os.path.expanduser("~/ssl/key.pem")



app = Flask(__name__)

# Connect to PostgreSQL
conn = psycopg2.connect(database="game_data", user="nhegde", password="nhegde", host="127.0.0.1", port="5432")
cursor = conn.cursor()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/sudoku')
def sudoku_page():
    return render_template('sudoku.html')

@app.route('/crossword')
def crossword_page():
    return render_template('crossword.html')



@app.route('/store-data', methods=['POST'])
def store_data():
    data = request.json
    game_type = data.get('game_type')
    email = data.get('email')
    timervalue = data.get('timervalue')

    if not game_type or game_type not in ["sudoku", "crossword"]:
        return jsonify({'message': 'Game Type must be "sudoku" or "crossword"!'}), 400
    if not email or not timervalue:
        return jsonify({'message': 'Email and Timer Value are required!'}), 400

    try:
        cursor.execute("INSERT INTO responses (game_type, email, timervalue) VALUES (%s, %s, %s) ON CONFLICT (email) DO NOTHING", 
                       (game_type, email, timervalue))
        conn.commit()
        return jsonify()
    except Exception as e:
        conn.rollback()  # ✅ Rollback the transaction on error
        return jsonify({'message': 'Error storing data', 'error': str(e)}), 500



@app.route('/get-data', methods=['GET'])
def get_data():
    cursor.execute("SELECT game_type, email, timervalue FROM responses")
    data = [{"game_type": row[0], "email": row[1], "timervalue": row[2]} for row in cursor.fetchall()]
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    #app.run(host="0.0.0.0", port=8443, ssl_context=(cert_path, key_path))

