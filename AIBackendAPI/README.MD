Assumes there is CRON job that populates the Usages and TopAIModels tables at midnight every night to
reduce overhead of every reqeust to the database doing multiple joins across many records to do calculations.

Con: Seeding code needs to change such that it is only called once per instance of this program.