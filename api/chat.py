"""Vercel entry point for the same chat handler used by the local server."""

from server import BearBudgetServer


class handler(BearBudgetServer):
    pass
