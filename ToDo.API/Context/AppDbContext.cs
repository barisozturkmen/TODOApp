using Microsoft.EntityFrameworkCore;
using ToDo.API.Models;

namespace ToDo.API.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            :base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ToDoTask> ToDos { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<ToDoTask>().ToTable("todos");
        }
    }
}
