# frozen_string_literal: true

class User < ApplicationRecord
  include Slugable

  second_level_cache expires_in: 1.week

  depends_on :devise, :avatar, :actions, :membership, :search

  has_many :owned_repositories, class_name: "Repository", dependent: :destroy
  has_many :user_actives, -> { order("updated_at desc, id desc") }, dependent: :destroy

  validates :name, presence: true, length: { in: 2..20 }
  validates :slug, uniqueness: true

  def to_path(suffix = nil)
    "/#{self.slug}#{suffix}"
  end

  def group?; false; end
  def user?; true; end

  def admin?
    Setting.has_admin?(self.email)
  end

  def repositories
    Repository.where(user_id: self.group_ids).order("updated_at desc")
  end
end