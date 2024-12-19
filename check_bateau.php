<?php
include('./db_connect.php');
header('Content-Type: application/json');

$coords = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $col = $coords['col'];
    $row = $coords['row'];
    $player = $coords['player'];
    
    $table = $player == 1 ? 'position_bateaux_j1': 'position_bateaux_j2';
    $sql = "SELECT bateau_id FROM $table WHERE `row` = :row AND col = :col";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':row', $row, PDO::PARAM_STR);
    $stmt->bindParam(':col', $col, PDO::PARAM_INT);
    $stmt->execute();
    
    //$result = $stmt->get_result();
    $fetch_row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($fetch_row['bateau_id'] != 0) {
        echo json_encode([
            "status" => "coup",
            "bateau_id" => $fetch_row['bateau_id']
        ]);
    } else {
            echo json_encode([
            "status" => "manqué"
        ]);
    }

}

?>