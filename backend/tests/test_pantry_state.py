"""Unit tests for the defensive clamping applied to Claude's receipt output."""

from app.services.pantry_state import (
    _clamp_quantity,
    _clamp_shelf_life,
    _safe_category,
)


def test_clamp_shelf_life_bounds():
    assert _clamp_shelf_life(0) == 1          # below floor
    assert _clamp_shelf_life(-5) == 1
    assert _clamp_shelf_life(10) == 10        # in range
    assert _clamp_shelf_life(9999) == 365     # above ceiling
    assert _clamp_shelf_life("14") == 14      # numeric string coerced


def test_clamp_shelf_life_defaults_on_garbage():
    assert _clamp_shelf_life(None) == 14
    assert _clamp_shelf_life("not-a-number") == 14


def test_clamp_quantity_bounds():
    assert _clamp_quantity(0) == 0.01         # below floor
    assert _clamp_quantity(-3) == 0.01
    assert _clamp_quantity(2.5) == 2.5        # in range
    assert _clamp_quantity(100000) == 9999.0  # above ceiling


def test_clamp_quantity_defaults_on_garbage():
    assert _clamp_quantity(None) == 1.0
    assert _clamp_quantity("bad") == 1.0


def test_safe_category():
    assert _safe_category("produce") == "produce"
    assert _safe_category("PRODUCE") == "produce"   # case-insensitive
    assert _safe_category("unknown-cat") == "other"  # unknown -> other
    assert _safe_category(None) == "other"
    assert _safe_category(123) == "other"            # non-string -> other
